let rollup = require('rollup');
let gulp = require('gulp');
let sass = require('gulp-sass');
let pkg = require('./package.json');
let buble = require('rollup-plugin-buble');
let uglify = require('rollup-plugin-uglify').uglify;
let minify = require('uglify-es');

const isProd = process.env.BUILD === 'production';

let plugins = [
  buble()
];


if (isProd) {
  plugins.push(uglify({}, minify));
}

gulp.task('scss', (done) => {
  gulp.src('./src/table-fits.scss')
    .pipe(sass()
      .on('error', sass.logError)
    )
    .pipe(gulp.dest('./dist'));

  done();
});

gulp.task('js', () => {
  return rollup.rollup({
    input: './src/index.js',
    plugins: plugins
  }).then(bundle => {
    return bundle.write({
      file: pkg.main,
      format: 'iife',
      name: 'TableFits',
      sourcemap: !isProd
    });
  });
});

gulp.task('watch', gulp.parallel('js', 'scss', (done) => {
  gulp.watch('./src/**/*.scss', gulp.series('scss'));
  gulp.watch('./src/**/*.js', gulp.series('js'));
  done();
}));

gulp.task('default', gulp.parallel('js', 'scss'));