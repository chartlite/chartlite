/**
 * A minimal, zero-dependency SVG DOM shim for server-side rendering.
 *
 * It implements exactly the subset of the DOM that Chartlite's render path uses
 * (see `renderToString`), so charts can produce an SVG string in Node/Bun/edge
 * where no real `document` exists — without pulling in jsdom. It is deliberately
 * NOT a general-purpose DOM; anything the charts don't call is absent.
 *
 * `installDOM()` swaps this in as `globalThis.document`/`HTMLElement` for the
 * duration of one synchronous render, then restores the previous globals. When a
 * real DOM is already present (browser/jsdom) it is a no-op and the real DOM is
 * used instead.
 */

const XHTML_NS = 'http://www.w3.org/1999/xhtml';

/** Escape a string for use in an XML/HTML attribute value. */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape a string for use as element text content. */
function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function camelToKebab(prop: string): string {
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** Minimal CSSStyleDeclaration stand-in. Records set properties for serialization. */
class StyleShim {
  private props = new Map<string, string>();

  setProperty(name: string, value: string): void {
    this.props.set(name, String(value));
  }

  /** Any other assignment (e.g. `.fontFamily = ...`) is trapped by the Proxy below. */
  _set(name: string, value: unknown): void {
    this.props.set(name, String(value));
  }

  _serialize(): string {
    if (this.props.size === 0) return '';
    return Array.from(this.props)
      .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
      .join('; ');
  }
}

function makeStyle(): StyleShim {
  const target = new StyleShim();
  return new Proxy(target, {
    set(t, prop, value) {
      if (typeof prop === 'string' && !(prop in t)) {
        t._set(prop, value);
        return true;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t as any)[prop] = value;
      return true;
    },
    get(t, prop) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (t as any)[prop];
    },
  }) as StyleShim;
}

/** Minimal DOMTokenList stand-in for `classList`. */
class ClassListShim {
  private set = new Set<string>();
  add(...tokens: string[]): void {
    tokens.forEach((t) => this.set.add(t));
  }
  remove(...tokens: string[]): void {
    tokens.forEach((t) => this.set.delete(t));
  }
  contains(token: string): boolean {
    return this.set.has(token);
  }
  _serialize(): string {
    return Array.from(this.set).join(' ');
  }
}

/**
 * A single shim element. Serves both SVG and (H)TML elements — the only HTML
 * element charts create directly is the container `<div>` and the `<style>` tag.
 */
export class ShimElement {
  tagName: string;
  namespaceURI: string;
  children: ShimElement[] = [];
  parentNode: ShimElement | null = null;

  private attributes = new Map<string, string>();
  private _style = makeStyle();
  private _classList = new ClassListShim();
  private _text = '';
  private _innerHTML: string | null = null;

  constructor(tagName: string, namespaceURI: string = XHTML_NS) {
    this.tagName = tagName;
    this.namespaceURI = namespaceURI;
  }

  setAttribute(name: string, value: string | number): void {
    this.attributes.set(name, String(value));
  }
  getAttribute(name: string): string | null {
    return this.attributes.has(name) ? this.attributes.get(name)! : null;
  }
  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }
  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }

  get style(): StyleShim {
    return this._style;
  }
  get classList(): ClassListShim {
    return this._classList;
  }

  set id(value: string) {
    this.setAttribute('id', value);
  }
  get id(): string {
    return this.getAttribute('id') ?? '';
  }

  set textContent(value: string) {
    this._text = String(value);
    this.children = [];
    this._innerHTML = null;
  }
  get textContent(): string {
    return this._text;
  }

  set innerHTML(value: string) {
    this._innerHTML = String(value);
    this.children = [];
    this._text = '';
  }
  get innerHTML(): string {
    return this._innerHTML ?? '';
  }

  appendChild<T extends ShimElement>(child: T): T {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  removeChild<T extends ShimElement>(child: T): T {
    const i = this.children.indexOf(child);
    if (i !== -1) this.children.splice(i, 1);
    child.parentNode = null;
    return child;
  }
  get firstChild(): ShimElement | null {
    return this.children[0] ?? null;
  }

  // Event handling is a no-op server-side (there is no interaction), but the
  // methods must exist because keyboard-nav setup wires listeners during render.
  addEventListener(): void {}
  removeEventListener(): void {}
  focus(): void {}

  /**
   * Not supported on purpose: the legend renderer calls `getBBox()` inside a
   * try/catch and falls back to width estimation when it throws. Throwing here
   * keeps SSR output deterministic (and matches jsdom, which also lacks layout).
   */
  getBBox(): never {
    throw new Error('getBBox is not available during server-side rendering');
  }

  /** Very small selector support — only the forms the render path actually uses. */
  querySelector(selector: string): ShimElement | null {
    const match = (el: ShimElement): boolean => {
      // Supported: 'tag', '.class', 'tag.class'
      const m = selector.match(/^([a-zA-Z]*)(?:\.([\w-]+))?$/);
      if (!m) return false;
      const [, tag, cls] = m;
      if (tag && el.tagName !== tag) return false;
      if (cls && !el._classList.contains(cls)) return false;
      return true;
    };
    const walk = (el: ShimElement): ShimElement | null => {
      for (const child of el.children) {
        if (match(child)) return child;
        const found = walk(child);
        if (found) return found;
      }
      return null;
    };
    return walk(this);
  }

  get outerHTML(): string {
    return serialize(this);
  }
}

function serialize(node: ShimElement): string {
  const attrs: string[] = [];

  // Merge classList into the class attribute.
  const classFromList = node.classList._serialize();
  const classAttr = node.getAttribute('class');
  const cls = [classAttr, classFromList].filter(Boolean).join(' ').trim();

  // Merge style object into the style attribute.
  const styleFromObj = node.style._serialize();
  const styleAttr = node.getAttribute('style');
  const style = [styleAttr, styleFromObj].filter(Boolean).join('; ').trim();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawAttrs = (node as any).attributes as Map<string, string>;
  for (const [k, v] of rawAttrs) {
    if (k === 'class' || k === 'style') continue;
    attrs.push(`${k}="${escapeAttr(v)}"`);
  }
  if (cls) attrs.push(`class="${escapeAttr(cls)}"`);
  if (style) attrs.push(`style="${escapeAttr(style)}"`);

  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

  // Inner content: children > raw innerHTML > escaped text.
  let inner = '';
  if (node.children.length) {
    inner = node.children.map(serialize).join('');
  } else if (node.innerHTML) {
    inner = node.innerHTML;
  } else if (node.textContent) {
    inner = escapeText(node.textContent);
  }

  if (!inner) {
    return `<${node.tagName}${attrStr}></${node.tagName}>`;
  }
  return `<${node.tagName}${attrStr}>${inner}</${node.tagName}>`;
}

/** Minimal Document stand-in. */
class ShimDocument {
  head = new ShimElement('head');
  body = new ShimElement('body');

  createElementNS(ns: string, tagName: string): ShimElement {
    return new ShimElement(tagName, ns);
  }
  createElement(tagName: string): ShimElement {
    return new ShimElement(tagName, XHTML_NS);
  }
  getElementById(id: string): ShimElement | null {
    const walk = (el: ShimElement): ShimElement | null => {
      if (el.getAttribute('id') === id) return el;
      for (const child of el.children) {
        const found = walk(child);
        if (found) return found;
      }
      return null;
    };
    return walk(this.head) ?? walk(this.body);
  }
}

/**
 * Install the shim as the global `document`/`HTMLElement` if no real DOM exists.
 * Returns a restore function. No-op (still returns a restore) when a real DOM is
 * already present, so callers can use the same try/finally shape.
 */
export function installDOM(): () => void {
  // A real DOM (browser or jsdom) is already usable — don't touch globals.
  if (typeof (globalThis as { document?: unknown }).document !== 'undefined') {
    return () => {};
  }

  const g = globalThis as Record<string, unknown>;
  const prevDoc = g.document;
  const prevHTMLElement = g.HTMLElement;

  g.document = new ShimDocument();
  // BaseChart validates `container instanceof HTMLElement`; make shim elements pass.
  g.HTMLElement = ShimElement;

  return () => {
    g.document = prevDoc;
    g.HTMLElement = prevHTMLElement;
  };
}
