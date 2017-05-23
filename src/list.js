export default function() {
  const fetchBaseUrl = 'https://node-hnapi.herokuapp.com';

  const _listTemplate = document.createElement('template');
  _listTemplate.innerHTML = `
<custom-style>
<style>
  :host {
    display: block;
  }
  .nav {
    padding: 1em;
    margin: 0 auto;
    text-align: center;
  }
  .prev, .next {
    color: #666;
    text-decoration: none;
    margin: 0 1em;
  }
  [disabled] {
    visibility: hidden;
  }
  #prerender {
    table-layout: fixed;
    border-collapse: collapse;
  }
  ol {
    counter-reset: Item 1;
    margin: 0;
    padding: 0;
    list-style-type: none;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
  }
  li {
    clear: both;
    margin: 1.5rem 0.5rem;
    font-size: 0.75em;
  }
  li:before {
    content: counter(Item, decimal);
    counter-increment: Item;
    font-size: 1.5rem;
    min-width: 1.5em;
    margin-right: 0.75rem;
    float: left;
    text-align: right;
    color: #666;
  }
  h3 {
    font-size: 1rem;
    font-weight: normal;
    margin: 0.5rem 0;
  }
  .title {
    color: #000;
    text-decoration: none;
  }
  .item {
    margin-left: 3rem;
  }
  .user, .comments {
    color: #333
  }
</style>
</custom-style>
<slot>
  <div class="nav"><a class="prev" disabled>&lt; prev</a> <span class="page"></span> / <span class="count"></span> <a class="next">next &gt;</a></div>
  <ol></ol>
  <div class="nav"><a class="prev" disabled>&lt; prev</a> <span class="page"></span> / <span class="count"></span> <a class="next">next &gt;</a></div>
</slot>`;

  const _itemTemplate = document.createElement('template');
  _itemTemplate.innerHTML = `
<li>
  <div class="item">
    <h3><a class="title"></a> <small></small></h3>
    <b></b> points by <a class="user"></a> <i></i> | <a class="comments"></a>
  </div>
</li>`;

  const _title = _itemTemplate.content.querySelector('.title');
  const _domain = _itemTemplate.content.querySelector('small');
  const _user = _itemTemplate.content.querySelector('.user');
  const _points = _itemTemplate.content.querySelector('b');
  const _timeago = _itemTemplate.content.querySelector('i');
  const _comments = _itemTemplate.content.querySelector('.comments');

  if (window.ShadyCSS) {
    ShadyCSS.prepareTemplate(_listTemplate, 'hn-list');
  }

  class HNList extends HTMLElement {
    static get observedAttributes() {
      return [ 'active', 'path', 'route', 'page' ];
    }

    constructor() {
      super();

      const shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(document.importNode(_listTemplate.content, true));
    }

    connectedCallback() {
      // if the node is already set to active then it was server-rendered
      // which means the nodes we are going to update are distributed, if
      // not then the nodes are the fallback ones set in the shadow template
      let active = this.hasAttribute('active');
      let node = (active) ? this : this.shadowRoot;

      this._ol = node.querySelector('ol');
      this._prev = node.querySelectorAll('.prev');
      this._next = node.querySelectorAll('.next');
      this._pageNo = node.querySelectorAll('.page');
      this._count = node.querySelectorAll('.count');

      if (window.ShadyCSS) {
        window.ShadyCSS.styleElement(this);
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case 'active':
          if (newValue !== null) {
            this._load();
          }
          break;
        case 'page':
          this._page = parseInt(newValue);
          break;
        default:
          if (oldValue !== newValue) {
            this[name] = newValue;
          }
          break;
      }
    }

    get path() { return this._path; }
    set path(val) { this._path = val; }

    get route() { return this._route; }
    set route(val) { this._route = val; }

    _load() {
      let paths = window.location.pathname.split('/');
      let page = paths.length < 3 ? 1 : parseInt(paths[2]);
      if (page === this._page) return;
      this._page = page;

      this._loading = true;
      let url = `${fetchBaseUrl}/${this._path}?page=${this._page}`;
      this._fetch(url).then(data => requestAnimationFrame(() => this._render(data)));
    }

    _fetch(url) {
      // scroll to top when fetching
      document.body.scrollTop = 0;
      return fetch(url).then(response => {
        return response.json().then(data => {
          this._pendingFetch = null;
          this._loading = false;
          return data;
        });
      }, reject => {
        if (!navigator.onLine) {
          this._view = 'offline';
        }
        this._loading = false;
        return Promise.reject(reject);
      });
    }

    _render(data) {
      while (this._ol.firstChild) {
        this._ol.removeChild(this._ol.firstChild);
      }

      this._ol.style.counterReset = 'Item ' + (this._page - 1) * 30;
      for(var i = 0; i < data.length; i++) {
        let x = data[i];

        _title.innerText = x.title;
        _domain.innerText = '(' + x.domain + ')';
        _user.innerText = x.user;
        _user.href = '/user/' + x.user;
        _points.innerText = x.points;
        _timeago.innerText = x.time_ago;
        _comments.innerText = x.comments_count + ' comments';
        let li = _itemTemplate.content.cloneNode(true);

        this._ol.appendChild(li);
      }

      this._prev.forEach(n => {
        n.href = '/' + this.route + '/' + (this._page - 1);
        if (this._page == 1) {
          n.setAttribute('disabled', '');
        } else {
          n.removeAttribute('disabled');
        }
      });
      this._next.forEach(n => {
        n.href = '/' + this.route + '/' + (this._page + 1);
        if (this._page >= 3) {
          n.setAttribute('disabled', '');
        } else {
          n.removeAttribute('disabled');
        }
      });
      this._pageNo.forEach(n => n.innerText = this._page);
      this._count.forEach(n => n.innerText = 3);
    }
  }

  customElements.define('hn-list', HNList);
}
