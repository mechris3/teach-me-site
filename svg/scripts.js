/* ===========================
   SVG Course — Course-Specific Scripts
   (Common scripts loaded from /scripts.js)
   =========================== */

// --- Auto-link SVG elements and attributes to reference doc ---
(function() {
  const content = document.querySelector('.main-content');
  if (!content) return;

  const REF_PATH = 'svg-elements-and-attributes.html';

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
    return null;
  }

  // Check if text is a known attribute name
  function getAttributeAnchor(text) {
    const clean = text.toLowerCase().replace(/['"]/g, '');
    return ATTRIBUTES[clean] || null;
  }

  // Check if text matches an element reference (with or without angle brackets)
  function getElementAnchor(text) {
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
