import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';


let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);
const isProd = process.env.BUILD === 'production';
let plugins = [
    babel(babelrc())
];

if (!isProd) {

} else {
    plugins.push(uglify({}, minify));
}

export default {
    entry: 'src/index.js',
    plugins: plugins,
    external: external,
    targets: [
        {
            dest: pkg.main,
            format: 'iife',
            moduleName: 'TableFits',
            sourceMap: !isProd
        }
    ]
};