/**
 * Keyboard navigation for charts.
 *
 * Encapsulates the focus state machine that lets keyboard users step through a
 * chart's data points (arrows / Home / End / Enter / Escape) with screen-reader
 * announcements via a shared ARIA live region. Extracted from BaseChart so the
 * stateful focus logic lives in one cohesive, testable unit.
 */

const SVG_LIVE_REGION_ID = 'chartlite-live-region';

export interface KeyboardNavigatorOptions {
  /** The focusable chart SVG. */
  svg: SVGSVGElement;
  /** Emit a plugin event (e.g. `datapoint:activate`). */
  emit: (eventName: string, data?: KeyboardActivationEvent) => void;
  /** Register an event listener through the chart's tracked-cleanup mechanism. */
  addListener: (element: Element, event: string, handler: EventListener) => void;
}

export interface KeyboardActivationEvent {
  element: SVGElement;
  index: number;
  ariaLabel: string | null;
}

export class KeyboardNavigator {
  private focusedIndex = -1;
  private focusedElement: SVGElement | null = null;
  private focusableElements: SVGElement[] = [];
  private liveRegion: HTMLElement | null = null;
  private readonly svg: SVGSVGElement;
  private readonly emit: (eventName: string, data?: KeyboardActivationEvent) => void;

  constructor(options: KeyboardNavigatorOptions) {
    this.svg = options.svg;
    this.emit = options.emit;

    options.addListener(this.svg, 'keydown', (event) => {
      if (event instanceof KeyboardEvent) this.handleKeyDown(event);
    });
    options.addListener(this.svg, 'focus', () => this.handleFocus());
    options.addListener(this.svg, 'blur', () => this.handleBlur());
  }

  private handleFocus(): void {
    // Chart is now focused - collect focusable elements
    this.collectFocusableElements();
  }

  private handleBlur(): void {
    // Clear focus from data points
    this.clearDataPointFocus();
    this.focusedIndex = -1;
  }

  private collectFocusableElements(): void {
    // Find all data points with the data-point class
    const elements = this.svg.querySelectorAll<SVGElement>('.data-point');
    this.focusableElements = Array.from(elements);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Prevent default scrolling for arrow keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        this.focusElement(this.focusedIndex + 1);
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        this.focusElement(this.focusedIndex - 1);
        break;

      case 'Home':
        this.focusElement(0);
        break;

      case 'End':
        this.focusElement(-1);
        break;

      case 'Enter':
      case ' ':
        this.activateCurrentElement();
        break;

      case 'Escape':
        this.clearDataPointFocus();
        this.focusedIndex = -1;
        // Blur the SVG to exit navigation
        this.svg.blur();
        break;
    }
  }

  private focusElement(index: number): void {
    if (this.focusableElements.length === 0) {
      this.collectFocusableElements();
    }
    const length = this.focusableElements.length;
    if (!length) return;

    this.focusedIndex = index < 0 ? length - 1 : index % length;
    this.clearDataPointFocus();
    const element = this.focusableElements[this.focusedIndex];
    element.classList.add('data-point-focused');
    element.setAttribute('data-focused', 'true');
    this.focusedElement = element;
    this.announceToScreenReader(element);
  }

  private clearDataPointFocus(): void {
    if (!this.focusedElement) return;
    this.focusedElement.classList.remove('data-point-focused');
    this.focusedElement.removeAttribute('data-focused');
    this.focusedElement = null;
  }

  private activateCurrentElement(): void {
    const element = this.focusableElements[this.focusedIndex];
    if (!element) return;

    // Mirror pointer activation so callbacks() and consumer click handlers work
    // identically for keyboard users.
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Emit event for plugins to handle (e.g., tooltip plugin)
    this.emit('datapoint:activate', {
      element,
      index: this.focusedIndex,
      ariaLabel: element.getAttribute('aria-label'),
    });
  }

  private announceToScreenReader(element: SVGElement): void {
    const ariaLabel = element.getAttribute('aria-label') || '';

    // Create or get live region
    if (!this.liveRegion) {
      this.liveRegion = document.getElementById(SVG_LIVE_REGION_ID);

      if (!this.liveRegion) {
        this.liveRegion = document.createElement('div');
        this.liveRegion.id = SVG_LIVE_REGION_ID;
        this.liveRegion.setAttribute('role', 'status');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        document.body.appendChild(this.liveRegion);
      }
    }

    // Update announcement
    this.liveRegion.textContent = ariaLabel;
  }
}
