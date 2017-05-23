import './polyfills';

import app from './app';
import about from './about';
import list from './list';

function bootstrap() {
  app();
  list();
  about();
}

var execute = window.requestIdleCallback || window.requestAnimationFrame || function(cb) { cb(); };
execute(() => {
  if (window.WebComponents && window.WebComponents.ready) {
    bootstrap();
  } else {
    window.addEventListener('WebComponentsReady', bootstrap);
  }
});

// import './service-worker';
