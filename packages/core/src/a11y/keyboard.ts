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
  emit: (eventName: string, data?: unknown) => void;
  /** Register an event listener through the chart's tracked-cleanup mechanism. */
  addListener: (element: EventTarget, event: string, handler: EventListener) => void;
}

export class KeyboardNavigator {
  private focusedIndex = -1;
  private focusableElements: SVGElement[] = [];
  private liveRegion: HTMLElement | null = null;
  private readonly svg: SVGSVGElement;
  private readonly emit: (eventName: string, data?: unknown) => void;

  constructor(options: KeyboardNavigatorOptions) {
    this.svg = options.svg;
    this.emit = options.emit;

    options.addListener(this.svg, 'keydown', (e) => this.handleKeyDown(e as KeyboardEvent));
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
    const elements = this.svg.querySelectorAll('.data-point');
    this.focusableElements = Array.from(elements) as SVGElement[];
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Prevent default scrolling for arrow keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        this.focusNextElement();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        this.focusPreviousElement();
        break;

      case 'Home':
        this.focusFirstElement();
        break;

      case 'End':
        this.focusLastElement();
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

  private focusNextElement(): void {
    if (this.focusableElements.length === 0) {
      this.collectFocusableElements();
    }

    if (this.focusableElements.length === 0) return;

    this.focusedIndex = (this.focusedIndex + 1) % this.focusableElements.length;
    this.applyFocusToElement(this.focusedIndex);
    this.announceToScreenReader();
  }

  private focusPreviousElement(): void {
    if (this.focusableElements.length === 0) {
      this.collectFocusableElements();
    }

    if (this.focusableElements.length === 0) return;

    this.focusedIndex =
      this.focusedIndex <= 0 ? this.focusableElements.length - 1 : this.focusedIndex - 1;
    this.applyFocusToElement(this.focusedIndex);
    this.announceToScreenReader();
  }

  private focusFirstElement(): void {
    if (this.focusableElements.length === 0) {
      this.collectFocusableElements();
    }

    if (this.focusableElements.length === 0) return;

    this.focusedIndex = 0;
    this.applyFocusToElement(this.focusedIndex);
    this.announceToScreenReader();
  }

  private focusLastElement(): void {
    if (this.focusableElements.length === 0) {
      this.collectFocusableElements();
    }

    if (this.focusableElements.length === 0) return;

    this.focusedIndex = this.focusableElements.length - 1;
    this.applyFocusToElement(this.focusedIndex);
    this.announceToScreenReader();
  }

  private applyFocusToElement(index: number): void {
    // Remove previous focus
    this.clearDataPointFocus();

    const element = this.focusableElements[index];
    if (!element) return;

    // Add focus class
    element.classList.add('data-point-focused');

    // Store current focus state
    element.setAttribute('data-focused', 'true');
  }

  private clearDataPointFocus(): void {
    this.focusableElements.forEach((el) => {
      el.classList.remove('data-point-focused');
      el.removeAttribute('data-focused');
    });
  }

  private activateCurrentElement(): void {
    if (this.focusedIndex < 0 || this.focusedIndex >= this.focusableElements.length) {
      return;
    }

    const element = this.focusableElements[this.focusedIndex];
    if (!element) return;

    // Emit event for plugins to handle (e.g., tooltip plugin)
    this.emit('datapoint:activate', {
      element,
      index: this.focusedIndex,
      ariaLabel: element.getAttribute('aria-label'),
    });
  }

  private announceToScreenReader(): void {
    if (this.focusedIndex < 0 || this.focusedIndex >= this.focusableElements.length) {
      return;
    }

    const element = this.focusableElements[this.focusedIndex];
    if (!element) return;

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
