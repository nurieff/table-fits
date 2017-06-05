let rollup = require('rollup-stream');
let source = require('vinyl-source-stream');
let gulp = require('gulp');
let sass = require('gulp-sass');

const isProd = process.env.BUILD === 'production';

gulp.task('scss', () => {
    return gulp.src('./assets/scss/**/*.scss')
        .pipe(sass()
            .on('error', sass.logError)
        )
        .pipe(gulp.dest('./css'));
});

gulp.task('js', () => {
    return rollup('rollup.config.js')
        .pipe(source('app.js'))
        .pipe(gulp.dest('./js'));
});

gulp.task('watch', () => {
    gulp.watch('./assets/scss/**/*.scss', ['scss']);
    gulp.watch('./assets/js/**/*.js', ['js']);
});

gulp.task('default', ['js', 'scss']);