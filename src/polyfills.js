// if this looks familiar, it's because it's a simplified version of
// the webcomponents-loader.js. We inline it into the single script
// and remove the pieces we don't need (e.g. html imports)

// global for (1) existence means `WebComponentsReady` will file,
// (2) WebComponents.ready == true means event has fired.
window.WebComponents = window.WebComponents || {};

// Feature detect which polyfill needs to be imported.
var polyfills = [];
if (!('attachShadow' in Element.prototype && 'getRootNode' in Element.prototype)) {
  polyfills.push('sd');
}
if (!window.customElements) {
  polyfills.push('ce');
}
// NOTE: any browser that does not have template or ES6 features
// must load the full suite (called `lite` for legacy reasons) of polyfills.
if (!('content' in document.createElement('template')) || !window.Promise || !Array.from ||
  // Edge has broken fragment cloning which means you cannot clone template.content
  !(document.createDocumentFragment().cloneNode() instanceof DocumentFragment)) {
  polyfills = ['lite'];
}

if (polyfills.length) {
  var script = document.createElement('script');
  var url = '/static/webcomponentsjs/webcomponents-' + polyfills.join('-') + '.js';
  script.src = url;
  document.head.appendChild(script);
} else {
  // Ensure `WebComponentsReady` is fired also when there are no polyfills loaded.
  window.WebComponents.ready = true;
  document.dispatchEvent(new CustomEvent('WebComponentsReady', {bubbles: true}));
}
