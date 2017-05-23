export default function() {
  const _routerTemplate = document.createElement('template');
  _routerTemplate.innerHTML = `
<style>
::slotted(*) {
  display: none;
}
::slotted([active]) {
  display: block;
}
</style>
<slot>
  <hn-list route="top" path="news"></hn-list>
  <hn-list route="new" path="newest"></hn-list>
  <hn-list route="ask" path="ask"></hn-list>
  <hn-list route="show" path="show"></hn-list>
  <hn-list route="jobs" path="jobs"></hn-list>
  <hn-item route="item"></hn-item>
  <hn-about route="about"></hn-about>
</slot>
`;

  if (window.ShadyCSS) {
    ShadyCSS.prepareTemplate(_routerTemplate, 'hn-app');
  }

  class HNApp extends HTMLElement {
    constructor() {
      super();

      const shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(document.importNode(_routerTemplate.content, true));
    }

    connectedCallback() {
      const slot = this.shadowRoot.querySelector('slot');
      const routeNodes = slot.assignedNodes({flatten: true}).filter(n => n.nodeType == Node.ELEMENT_NODE && n.hasAttribute('route'));
      this.active = null;
      this.rendered = false;
      this.routes = routeNodes.reduce((routes, node) => {
        if (node.hasAttribute('active')) {
          this.active = node;
          this.rendered = true;
        }
        let route = node.getAttribute('route');
        routes[route] = node;
        return routes;
      }, {});

      document.body.addEventListener('click', e => this._handleClick(e));
      window.addEventListener('popstate', () => this._handleUrlChange());

      if (window.ShadyCSS) {
        window.ShadyCSS.styleElement(this);
      }

      if (!this.rendered) {
        this._handleUrlChange();
      }
    }

    _handleClick(e) {
      if ((e.button !== 0) || (e.metaKey || e.ctrlKey)) {
        return;
      }

      let origin = (window.location.origin)
                 ? window.location.origin
                 : window.location.protocol + '//' + window.location.host;

      let anchor = e.composedPath().filter(n => n.localName === 'a')[0];
      if (anchor && anchor.href.indexOf(origin) === 0) {
        e.preventDefault();
        window.history.pushState({}, '', anchor.href);
        this._handleUrlChange();
      }
    }

    _handleUrlChange() {
      let paths = window.location.pathname.split('/');
      let name = paths[1] || 'news';
      let route = this.routes[name] || this.routes.unknown;

      if (this.active && this.active !== route) {
        this.active.removeAttribute('active');
      }

      this.active = route;
      this.active.setAttribute('active', '');
    }

    _computePath(location) {
      return window.decodeURIComponent(window.location.pathname).slice(1).split('/');
    }
  }

  customElements.define('hn-app', HNApp);
}
