/* ===========================
   SVG Course — Global Scripts
   =========================== */

// --- Theme toggle ---
function getPreferredTheme() {
  const stored = localStorage.getItem('lesson-theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('lesson-theme', theme);
  const icon = document.querySelector('.theme-toggle');
  if (icon) icon.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}
applyTheme(getPreferredTheme());

// --- Copy button ---
function copyCode(btn) {
  const code = btn.parentElement.querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
  });
}

// --- Quiz ---
function checkAnswer(el, correct) {
  const quiz = el.closest('.quiz');
  // If already answered correctly, lock the quiz — no need to retry
  if (quiz.dataset.answered === 'correct') return;

  // Clear previous attempt styling
  const options = quiz.querySelectorAll('.quiz-option');
  options.forEach(opt => {
    opt.classList.remove('correct', 'incorrect');
    opt.style.pointerEvents = '';
  });

  const feedback = quiz.querySelector('.quiz-feedback');
  if (correct) {
    el.classList.add('correct');
    quiz.dataset.answered = 'correct';
    feedback.textContent = '\u2713 Correct!';
    feedback.style.color = 'var(--quiz-correct-text)';
  } else {
    el.classList.add('incorrect');
    quiz.dataset.answered = 'incorrect';
    feedback.textContent = '\u2717 Not quite. Try again!';
    feedback.style.color = 'var(--quiz-incorrect-text)';
  }
}

// --- Sidebar TOC auto-generation ---
(function() {
  const tocList = document.getElementById('toc-list');
  if (!tocList) return;
  const headings = document.querySelectorAll('.main-content h2, .main-content h3');
  headings.forEach((h, i) => {
    if (!h.id) h.id = 'section-' + i;
    const li = document.createElement('li');
    if (h.tagName === 'H2') li.classList.add('toc-h2');
    if (h.tagName === 'H3') li.classList.add('toc-h3');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    tocList.appendChild(li);
  });

  // Scroll spy: highlight current section in TOC
  const tocLinks = tocList.querySelectorAll('a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('toc-active'));
        const activeLink = tocList.querySelector('a[href="#' + entry.target.id + '"]');
        if (activeLink) activeLink.classList.add('toc-active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));
})();

// --- Auto-link SVG elements and attributes to reference doc ---
(function() {
  const content = document.querySelector('.main-content');
  if (!content) return;

  const REF_PATH = '../reference/svg-elements-and-attributes.html';

  // Map: element name (lowercase) -> anchor id in the reference doc
  const ELEMENTS = {
    'svg': 'el-svg', 'g': 'el-g', 'defs': 'el-defs', 'symbol': 'el-symbol',
    'use': 'el-use', 'switch': 'el-switch',
    'rect': 'el-rect', 'circle': 'el-circle', 'ellipse': 'el-ellipse',
    'line': 'el-line', 'polyline': 'el-polyline', 'polygon': 'el-polygon',
    'path': 'el-path',
    'text': 'el-text', 'tspan': 'el-tspan', 'textpath': 'el-textpath',
    'lineargradient': 'el-lineargradient', 'radialgradient': 'el-radialgradient',
    'stop': 'el-stop', 'pattern': 'el-pattern',
    'clippath': 'el-clippath', 'mask': 'el-mask',
    'filter': 'el-filter',
    'animate': 'el-animate', 'animatetransform': 'el-animatetransform',
    'animatemotion': 'el-animatemotion', 'mpath': 'el-mpath', 'set': 'el-set',
    'title': 'el-title', 'desc': 'el-desc', 'metadata': 'el-metadata',
    'a': 'el-a', 'marker': 'el-marker',
    'image': 'el-image', 'foreignobject': 'el-foreignobject',
    // Filter primitives -> link to filter section
    'feblend': 'el-filter', 'fecolormatrix': 'el-filter',
    'fecomponenttransfer': 'el-filter', 'fecomposite': 'el-filter',
    'feconvolvematrix': 'el-filter', 'fediffuselighting': 'el-filter',
    'fedisplacementmap': 'el-filter', 'fedropshadow': 'el-filter',
    'feflood': 'el-filter', 'fegaussianblur': 'el-filter',
    'feimage': 'el-filter', 'femerge': 'el-filter', 'femergenode': 'el-filter',
    'femorphology': 'el-filter', 'feoffset': 'el-filter',
    'fespecularlighting': 'el-filter', 'fetile': 'el-filter',
    'feturbulence': 'el-filter',
    'fedistantlight': 'el-filter', 'fepointlight': 'el-filter', 'fespotlight': 'el-filter',
    'fefuncr': 'el-filter', 'fefuncg': 'el-filter', 'fefuncb': 'el-filter', 'fefunca': 'el-filter'
  };

  // Presentation attributes -> link to the presentation-attrs section
  const ATTRIBUTES = {
    'viewbox': 'el-svg', 'preserveaspectratio': 'el-svg',
    'fill': 'presentation-attrs', 'fill-opacity': 'presentation-attrs',
    'fill-rule': 'presentation-attrs', 'stroke': 'presentation-attrs',
    'stroke-width': 'presentation-attrs', 'stroke-linecap': 'presentation-attrs',
    'stroke-linejoin': 'presentation-attrs', 'stroke-dasharray': 'presentation-attrs',
    'stroke-dashoffset': 'presentation-attrs', 'stroke-opacity': 'presentation-attrs',
    'stroke-miterlimit': 'presentation-attrs', 'opacity': 'presentation-attrs',
    'transform': 'presentation-attrs', 'transform-origin': 'presentation-attrs',
    'visibility': 'presentation-attrs', 'display': 'presentation-attrs',
    'clip-path': 'presentation-attrs', 'filter': 'presentation-attrs',
    'mask': 'presentation-attrs', 'color': 'presentation-attrs',
    'font-family': 'presentation-attrs', 'font-size': 'presentation-attrs',
    'font-weight': 'presentation-attrs', 'font-style': 'presentation-attrs',
    'text-anchor': 'presentation-attrs', 'dominant-baseline': 'presentation-attrs',
    'text-decoration': 'presentation-attrs', 'letter-spacing': 'presentation-attrs',
    'word-spacing': 'presentation-attrs', 'pointer-events': 'presentation-attrs',
    'cursor': 'presentation-attrs', 'overflow': 'presentation-attrs',
    'pathlength': 'el-path',
    'gradientunits': 'el-lineargradient', 'gradienttransform': 'el-lineargradient',
    'spreadmethod': 'el-lineargradient',
    'patternunits': 'el-pattern', 'patterncontentunits': 'el-pattern',
    'patterntransform': 'el-pattern',
    'clippathunits': 'el-clippath',
    'maskunits': 'el-mask', 'maskcontentunits': 'el-mask',
    'filterunits': 'el-filter', 'primitiveunits': 'el-filter',
    'markerwidth': 'el-marker', 'markerheight': 'el-marker',
    'refx': 'el-marker', 'refy': 'el-marker',
    'orient': 'el-marker', 'markerunits': 'el-marker',
    'marker-start': 'el-marker', 'marker-mid': 'el-marker', 'marker-end': 'el-marker',
    'attributename': 'el-animate', 'calcmode': 'el-animate',
    'keytimes': 'el-animate', 'keysplines': 'el-animate',
    'repeatcount': 'el-animate', 'repeatdur': 'el-animate',
    'additive': 'el-animate', 'accumulate': 'el-animate',
    'keypoints': 'el-animatemotion',
    'textlength': 'el-text', 'lengthadjust': 'el-text',
    'startoffset': 'el-textpath',
    'stop-color': 'el-stop', 'stop-opacity': 'el-stop',
    'dur': 'el-animate',
    'cx': 'el-circle', 'cy': 'el-circle', 'r': 'el-circle',
    'rx': 'el-ellipse', 'ry': 'el-ellipse',
    'x1': 'el-line', 'y1': 'el-line', 'x2': 'el-line', 'y2': 'el-line',
    'points': 'el-polygon', 'd': 'el-path',
    'href': 'el-use'
  };

  // Extract element name from text like "<circle>", "<animate>", etc.
  function extractElementName(text) {
    const m = text.match(/^<\/?([a-zA-Z]+)>$/);
    if (m) return m[1].toLowerCase();
    // Also match just the tag name without brackets like "circle", "path"
    return null;
  }

  // Check if text is a known attribute name
  function getAttributeAnchor(text) {
    const clean = text.toLowerCase().replace(/['"]/g, '');
    return ATTRIBUTES[clean] || null;
  }

  // Check if text matches an element reference (with or without angle brackets)
  function getElementAnchor(text) {
    // <element> or </element>
    const elName = extractElementName(text);
    if (elName && ELEMENTS[elName]) return ELEMENTS[elName];
    return null;
  }

  // Process all <code> elements in the main content
  const codeEls = content.querySelectorAll('code');
  codeEls.forEach(code => {
    // Skip if already inside a link
    if (code.closest('a')) return;
    // Skip if inside a <pre> (code block)
    if (code.closest('pre')) return;

    const text = code.textContent.trim();
    let anchor = getElementAnchor(text) || getAttributeAnchor(text);
    if (!anchor) return;

    // Wrap the code element in a link
    const link = document.createElement('a');
    link.href = REF_PATH + '#' + anchor;
    link.className = 'ref-link';
    link.title = 'View in reference';
    code.parentNode.insertBefore(link, code);
    link.appendChild(code);
  });
})();

// --- Quiz accessibility: add role, tabindex, and keyboard support ---
(function() {
  const options = document.querySelectorAll('.quiz-option');
  options.forEach(opt => {
    opt.setAttribute('role', 'button');
    opt.setAttribute('tabindex', '0');
    opt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        opt.click();
      }
    });
  });

  // Make quiz feedback a live region for screen readers
  const feedbacks = document.querySelectorAll('.quiz-feedback');
  feedbacks.forEach(fb => {
    fb.setAttribute('aria-live', 'polite');
    fb.setAttribute('role', 'status');
  });
})();
