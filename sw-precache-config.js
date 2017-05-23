/* eslint-env node */
const path = 'https://node-hnapi.herokuapp.com';

module.exports = {
  staticFileGlobs: [
    '/index.html',
    '/manifest.json',
    '/webcomponentsjs/webcomponents*.js'
  ],
  navigateFallback: '/index.html',
  runtimeCaching: [
    {
      urlPattern: new RegExp(`${path}/(news|newest|ask|show|jobs)`),
      handler: 'fastest',
      options: {
        cache: {
          maxEntries: 30,
          name: 'articles-cache'
        }
      }
    }, {
      urlPattern: new RegExp(`${path}/item/`),
      handler: 'fastest',
      options: {
        cache: {
          maxEntries: 30,
          name: 'comments-cache'
        }
      }
    }, {
      urlPattern: new RegExp(`${path}/user/`),
      handler: 'fastest',
      options: {
        cache: {
          maxEntries: 30,
          name: 'user-cache'
        }
      }
    }
  ],
  navigateFallback: 'index.html',
};
