var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('default', function () {
    return gulp.src('./scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});