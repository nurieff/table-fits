let rollup = require('rollup-stream');
let source = require('vinyl-source-stream');
let gulp = require('gulp');
let sass = require('gulp-sass');
//let babel = require('rollup-plugin-babel');
//let babelrc = require('babelrc-rollup');
//let uglify = require('rollup-plugin-uglify');
//let minify = require('uglify-es').minify;

const isProd = process.env.BUILD === 'production';

gulp.task('scss', () => {
    return gulp.src('./src/table-fits.scss')
        .pipe(sass()
            .on('error', sass.logError)
        )
        .pipe(gulp.dest('./dist'));
});

gulp.task('js', () => {
    return rollup('rollup.config.js')
        .pipe(source('table-fits.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', () => {
    gulp.watch('./src/**/*.scss', ['scss']);
    gulp.watch('./src/**/*.js', ['js']);
});

gulp.task('default', ['js', 'scss']);