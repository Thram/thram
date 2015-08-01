/**
 * Created by thram on 20/07/15.
 */
var gulp        = require('gulp'),
    concat      = require('gulp-concat'),
    rename      = require('gulp-rename'),
    uglify      = require('gulp-uglify'),
    jshint      = require('gulp-jshint'),
    browserSync = require('browser-sync').create(),
    fileInclude = require('gulp-file-include'),
    gzip        = require('gulp-gzip'),
    del         = require('del'),
    sync        = require('gulp-sync')(gulp);

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
    return gulp.src([
        'src/thram.js',
        'src/modules/exceptions.js',
        'src/modules/toolbox.js',
        'src/modules/ajax.js',
        'src/modules/dom.js',
        'src/modules/storage.js',
        'src/modules/templates.js',
        'src/modules/router.js',
        'src/modules/event.js',
        'src/modules/animations.js',
        'src/modules/transitions.js'
    ]).pipe(concat('thram.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('example'))
        .pipe(rename('thram.min.js'))
        .pipe(uglify())
        .pipe(gzip({append: false}))
        .pipe(gulp.dest('dist'));
});

gulp.task('templates', function () {
    gulp.src(['src/example/index.html'])
        .pipe(fileInclude({
            template: '<script type="text/template" id="@filename"> @content </script>'
        }))
        .pipe(gulp.dest('example/'));
});

gulp.task('watch', function () {
    var src = {
        html: 'src/example/**/*.html',
        js  : 'example/example.js'
    };

    gulp.watch([src.html], ['templates']);
    gulp.watch([src.js], ['build']);
    gulp.watch([src.html, src.js]).on('change', browserSync.reload);
});

gulp.task('browser-sync', function () {
    browserSync.init({
        server        : {
            baseDir: 'example'
        },
        logLevel      : 'debug',
        logConnections: true
    });
});

gulp.task('dist', sync.sync(['clean', ['lint', 'build']]));
gulp.task('example', sync.sync(['clean', ['templates', 'lint', 'build', 'browser-sync', 'watch']]));
