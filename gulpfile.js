var gulp = require("gulp")
    , rename = require("gulp-rename")
    , sourcemaps = require('gulp-sourcemaps')
    , uglify = require('gulp-uglify')
    , buble = require('gulp-buble')
;

gulp.task("dev", function() {

    return gulp.src('./src/*.js')
        .pipe(sourcemaps.init())
        .pipe(buble())
        .pipe(sourcemaps.write())
        .pipe(rename("table-fits.js"))
        .pipe(gulp.dest('./dist/'));
});

gulp.task("default", function(callback) {

    return gulp.src('./src/*.js')
        .pipe(buble())
        .pipe(uglify())
        .pipe(rename("table-fits.min.js"))
        .pipe(gulp.dest('./dist/'));
})
;

gulp.task("watch", function() {

    gulp.watch([
        './src/**/*.js'
    ], ['dev']);

});