export default function() {
  const _aboutTemplate = document.createElement('template');
  _aboutTemplate.innerHTML = `
<custom-style>
<style>
  :host {
    display: block;
  }
</style>
</custom-style>
<slot>
  <h1>About</h1>
  <p>This is an example of a PWA built using pure WebComponents.</p>
  <p>It is not intended to be any kind of definitive blueprint for building applications,
     just an example to demonstrate that it is possible to build a modern, fast, Progressive
     Web App without depending on a framework - because WebComponents are like having a
     framework that is built in to the browser.</p>
  <p><a href="https://github.com/CaptainCodeman/hn-webcomponents">Github Repo</a>.</p>
</slot>`;

  if (window.ShadyCSS) {
    ShadyCSS.prepareTemplate(_aboutTemplate, 'hn-about');
  }

  class HNAbout extends HTMLElement {
    constructor() {
      super();

      const shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(document.importNode(_aboutTemplate.content, true));
    }

    connectedCallback() {
      if (window.ShadyCSS) {
        window.ShadyCSS.styleElement(this);
      }
    }
  }

  customElements.define('hn-about', HNAbout);
}
