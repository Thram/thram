/**
 * Created by thram on 20/07/15.
 */
var gulp        = require('gulp'),
    concat      = require('gulp-concat'),
    rename      = require('gulp-rename'),
    uglify      = require('gulp-uglify'),
    jshint      = require('gulp-jshint'),
    serve       = require('gulp-serve'),
    compass     = require('gulp-compass'),
    notify      = require('gulp-notify'),
    livereload  = require('gulp-livereload'),
    fileinclude = require('gulp-file-include'),
    plumber     = require('gulp-plumber'),
    gzip        = require('gulp-gzip'),
    del         = require('del'),
    sync        = require('gulp-sync')(gulp),
    path        = require('path');

gulp.task('usemin', function () {
    gulp.src('client/templates/*.html')
        .pipe(usemin())
        .pipe(gulp.dest('public/templates'));
    gulp.src('client/templates/views/*.html')
        .pipe(usemin())
        .pipe(gulp.dest('public/templates/views'));
    return gulp.src('client/templates/components/*.html')
        .pipe(usemin())
        .pipe(gulp.dest('public/templates/components'));
});

//the title and icon that will be used for the Grunt notifications
var notifyInfo = {
    title: 'Gulp',
    icon : path.join(__dirname, 'gulp.png')
};

//error notification settings for plumber
var plumberErrorHandler = {
    errorHandler: notify.onError({
        title  : notifyInfo.title,
        icon   : notifyInfo.icon,
        message: "Error: <%= error.message %>"
    })
};

gulp.task('clean', function (cb) {
    del(['dist/*'], cb);
});

// Lint Task
gulp.task('lint', function () {
    return gulp.src('src/**/*.js')
        .pipe(jshint({expr: true}))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', function () {
    return gulp.src('src/**/*.js')
        .pipe(concat('thram.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('thram.min.js'))
        .pipe(uglify())
        .pipe(gzip({append: false}))
        .pipe(gulp.dest('dist'));
});

var sass = require('gulp-sass');

gulp.task('fonts', function () {
    gulp.src('src/stylesheets/fonts/*')
        .pipe(gulp.dest('dist/fonts'))
        .pipe(gulp.dest('example/fonts'));
});

//styles
gulp.task('styles', function () {
    return gulp.src(['src/stylesheets/playground.scss'])
        .pipe(plumber(plumberErrorHandler))
        .pipe(compass({
            sass : 'src/stylesheets',
            image: 'src/images'
        }))
        .pipe(gulp.dest('example/css'));
});

gulp.task('styles:watch', function () {
    gulp.watch(['src/stylesheets/playground.scss', 'src/stylesheets/**/*.scss'], ['styles']);
});

gulp.task('watch', function () {
    gulp.watch(['src/scripts/thram.js', 'src/scripts/**/*.js'], ['dist']);
});

gulp.task('templates', function () {
    gulp.src(['src/example/index.html'])
        .pipe(fileinclude({
            template: '<script type="text/template" id="@filename"> @content </script>'
        }))
        .pipe(gulp.dest('example/'));
});

gulp.task('serve', serve(['example']));

gulp.task('dist', sync.sync(['clean', ['lint', 'build']]));
gulp.task('server', sync.sync(['clean', ['templates', 'lint', 'styles', 'fonts', 'build', 'serve', 'watch', 'styles:watch']]));
