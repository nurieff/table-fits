import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import {minify} from 'uglify-es';


let pkg = require('./package.json');
//let external = Object.keys(pkg.dependencies);
const isProd = process.env.BUILD === 'production';
let plugins = [
    buble()
];

if (isProd) {
    plugins.push(uglify({}, minify));
}

export default {
    entry: 'assets/js/app.js',
    plugins: plugins,
    dest: 'js/app.js',
    format: 'iife',
    moduleName: 'App',
    sourceMap: !isProd
};