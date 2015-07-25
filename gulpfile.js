/**
 * Created by thram on 20/07/15.
 */
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    serve = require('gulp-serve'),
    gzip = require('gulp-gzip'),
    del = require('del');


gulp.task('clean', function (cb) {
    del(['dist/*'], cb);
});

// Lint Task
gulp.task('lint', function () {
    return gulp.src(['src/scripts/thram.js', 'src/scripts/**/*.js'])
        .pipe(jshint({expr: true}))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', function () {
    return gulp.src(['src/scripts/thram.js', 'src/scripts/**/*.js'])
        .pipe(concat('thram.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('example'))
        .pipe(rename('thram.min.js'))
        .pipe(uglify())
        //.pipe(gzip({append:false}))
        .pipe(gulp.dest('dist'));
});

var sass = require('gulp-sass');

gulp.task('sass', function () {
    gulp.src('src/stylesheets/thram.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('example'));
});
gulp.task('fonts', function () {
    gulp.src('src/stylesheets/fonts/*')
        .pipe(gulp.dest('dist/fonts'))
        .pipe(gulp.dest('example/fonts'));
});

gulp.task('sass:watch', function () {
    gulp.watch(['src/stylesheets/thram.scss', 'src/stylesheets/**/*.scss'], ['sass']);
});

gulp.task('watch', function () {
    gulp.watch(['src/scripts/thram.js', 'src/scripts/**/*.js'], ['dist']);
});

gulp.task('serve', serve(['example']));

gulp.task('dist', ['clean', 'lint', 'build']);
gulp.task('server', ['clean', 'lint', 'sass', 'fonts', 'build', 'serve', 'watch', 'sass:watch']);
