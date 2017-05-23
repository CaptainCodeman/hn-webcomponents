var rollup = require('rollup');

var babel = require('rollup-plugin-babel');
var uglify = require('rollup-plugin-uglify');
var minify = require('uglify-es').minify;

rollup.rollup({
  entry: 'src/index.js',
  plugins: [
    babel({
      presets: [
        [ "es2016" ]
      ],
      plugins: [
        "external-helpers"
      ],
      runtimeHelpers: true,
      babelrc: false,
      sourceMap: true
    }),
    uglify({
      sourceMap: true
    }, minify)
  ]
}).then(function(bundle) {
  bundle.write({
    dest: 'server/static/index.min.js',
    format: 'iife',
    sourceMap: true,
    /*
    banner: `function bootstrap() {`,
    footer: `};
var execute = window.requestIdleCallback || window.requestAnimationFrame || function(cb) { cb(); };
execute(function() {
  if (window.WebComponents && window.WebComponents.ready) {
    bootstrap();
  } else {
    window.addEventListener('WebComponentsReady', bootstrap);
  }
});`
*/
  });
});
