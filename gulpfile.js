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
    return gulp.src(['src/thram.js', 'src/modules/*.js'])
        .pipe(jshint({expr: true}))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', function () {
    return gulp.src(['src/thram.js', 'src/modules/*.js'])
        .pipe(concat('thram.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('example'))
        .pipe(rename('thram.min.js'))
        .pipe(uglify())
        //.pipe(gzip({append:false}))
        .pipe(gulp.dest('dist'));
});

gulp.task('compress', function () {
    gulp.src('./dev/scripts/*.js')
        .pipe(gzip())
        .pipe(gulp.dest('./public/scripts'));
});

gulp.task('watch', function () {
    gulp.watch(['src/*.js', 'src/**/*.js'], ['dist']);
});

gulp.task('serve', serve(['example']));

gulp.task('dist', ['clean', 'lint', 'build']);
gulp.task('server', ['clean', 'lint', 'build', 'serve', 'watch']);
