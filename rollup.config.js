'use strict';

import babel from 'rollup-plugin-babel';
import hash from 'rollup-plugin-hash';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

let development = process.env.NODE_ENV === 'development';

export default {
  entry: 'src/index.js',
  dest: 'server/static/index.js',
  format: 'iife',
  sourceMap: development,
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
      sourceMap: development
    }),

    (!development && hash({
      dest: 'server/static/index.[hash].js',
      manifest: 'server/index.json'
    })),

    (!development && uglify({
      sourceMap: development
    }, minify))
  ]
}
