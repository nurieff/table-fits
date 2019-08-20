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

gulp.task('scss', () => {
  return gulp.src('./assets/scss/**/*.scss')
    .pipe(sass()
      .on('error', sass.logError)
    )
    .pipe(gulp.dest('./css'));
});

gulp.task('js', () => {
  return rollup.rollup({
    input: './assets/js/app.js',
    plugins: plugins
  }).then(bundle => {
    return bundle.write({
      file: 'js/app.js',
      format: 'iife',
      name: 'App',
      sourcemap: !isProd
    });
  });
});

gulp.task('watch', gulp.parallel('js', 'scss', (done) => {
  gulp.watch('./assets/scss/**/*.scss', gulp.series('scss'));
  gulp.watch('./assets/js/**/*.js', gulp.series('js'));
  done();
}));

gulp.task('default', gulp.parallel('js', 'scss'));