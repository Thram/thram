/**
 * Created by thram on 20/07/15.
 */
var gulp = require('gulp'),
    sync = require('gulp-sync')(gulp),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

gulp.task('js-fef', function () {
    return gulp.src(['src/'])
        .pipe(concat('thram.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('thram.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['js-fef'], function () {
});