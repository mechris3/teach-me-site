/* ===========================
   SVG Filter Tools - Shared JS
   =========================== */

/**
 * FilterTool - base class for all filter tool pages.
 * Handles: real-time preview updates, code generation, copy button, target image switching.
 *
 * Usage in each tool page:
 *   const tool = new FilterTool({
 *     filterElement: 'feGaussianBlur',
 *     buildFilter() { ... return SVG filter string ... }
 *   });
 *   // `this` inside buildFilter refers to the FilterTool instance,
 *   // so use this.val('id') and this.num('id') to read controls.
 */
class FilterTool {
  constructor(options) {
    this.filterElement = options.filterElement;
    this._buildFilter = options.buildFilter;
    this.onControlChange = options.onControlChange || null;

    this.previewSvg = document.getElementById('preview-svg');
    this.codeOutput = document.getElementById('code-output');
    this.filterDefs = document.getElementById('filter-defs');
    this.filteredTarget = document.getElementById('filtered-target');

    this._bindControls();
    this._bindTargetSelector();
    this._bindCopyButton();

    // Defer first update to next microtask so the calling script's
    // `tool` variable is assigned before buildFilter() runs.
    Promise.resolve().then(() => this.update());
  }

  /** Bind all input/select/checkbox controls to trigger update() */
  _bindControls() {
    const controls = document.querySelectorAll('.controls-panel input, .controls-panel select');
    controls.forEach(control => {
      const event = (control.type === 'range' || control.type === 'color')
        ? 'input'
        : 'change';

      // For range sliders: sync the number input FIRST, then update
      if (control.type === 'range') {
        control.addEventListener(event, () => {
          const display = document.getElementById(control.id + '-val');
          if (display) {
            if (display.tagName === 'INPUT') {
              display.value = control.value;
            } else {
              display.textContent = control.value;
            }
          }
          this.update();
        });
      } else {
        control.addEventListener(event, () => this.update());
      }
    });

    // Number inputs: sync to matching range slider, then update
    const numberInputs = document.querySelectorAll('.controls-panel input[type="number"]');
    numberInputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.id.endsWith('-val')) {
          const sliderId = input.id.slice(0, -4);
          const slider = document.getElementById(sliderId);
          if (slider && slider.type === 'range') {
            slider.value = input.value;
          }
        }
        this.update();
      });
    });

    // Text inputs (e.g. matrix values)
    const textInputs = document.querySelectorAll('.controls-panel input[type="text"]');
    textInputs.forEach(input => {
      input.addEventListener('input', () => this.update());
    });
  }

  /** Target image switching */
  _bindTargetSelector() {
    const buttons = document.querySelectorAll('.target-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._setTarget(btn.dataset.target);
        this.update();
      });
    });
  }

  _setTarget(targetId) {
    const targets = document.querySelectorAll('.target-shape');
    targets.forEach(t => {
      t.style.display = t.dataset.target === targetId ? '' : 'none';
    });
  }

  /** Copy button */
  _bindCopyButton() {
    const btn = document.getElementById('copy-code-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const code = this.codeOutput.textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
      });
    });
  }

  /** Main update - called on every control change */
  update() {
    const filterMarkup = this._buildFilter.call(this);

    // Update the live SVG filter using proper SVG DOM methods
    if (this.filterDefs) {
      // Remove old filter element(s)
      while (this.filterDefs.firstChild) {
        this.filterDefs.removeChild(this.filterDefs.firstChild);
      }

      // Parse the new filter as SVG and append it
      const svgNS = 'http://www.w3.org/2000/svg';
      const tempSvg = document.createElementNS(svgNS, 'svg');
      tempSvg.innerHTML = `<filter id="tool-filter">${filterMarkup}</filter>`;
      const newFilter = tempSvg.firstElementChild;
      this.filterDefs.appendChild(this.filterDefs.ownerDocument.importNode(newFilter, true));

      // Force re-application of the filter by toggling the attribute
      if (this.filteredTarget) {
        this.filteredTarget.setAttribute('filter', 'none');
        // Use requestAnimationFrame for a reliable repaint
        requestAnimationFrame(() => {
          this.filteredTarget.setAttribute('filter', 'url(#tool-filter)');
        });
      }
    }

    // Update the code output
    if (this.codeOutput) {
      const formatted = this._formatCode(filterMarkup);
      this.codeOutput.textContent = formatted;
      // Re-highlight if Prism is available
      if (window.Prism) {
        Prism.highlightElement(this.codeOutput);
      }
    }

    // Call custom handler if provided
    if (this.onControlChange) {
      this.onControlChange();
    }
  }

  /** Format filter markup for display */
  _formatCode(filterMarkup) {
    const lines = filterMarkup.trim().split('\n');
    const indented = lines.map(l => '  ' + l.trim()).join('\n');
    return `<filter id="my-filter">\n${indented}\n</filter>`;
  }

  /** Helper: get value from a control by ID */
  val(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked;
    // If there's a paired number input, it's the source of truth
    // (it can hold values beyond the slider's max)
    if (el.type === 'range') {
      const numInput = document.getElementById(id + '-val');
      if (numInput && numInput.tagName === 'INPUT' && numInput.type === 'number') {
        return numInput.value;
      }
    }
    return el.value;
  }

  /** Helper: get numeric value */
  num(id) {
    return parseFloat(this.val(id)) || 0;
  }
}
