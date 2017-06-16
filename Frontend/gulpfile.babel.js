'use strict';

import gulp from 'gulp';
import babelify from 'babelify';
import browserify from 'browserify';
import concat from 'gulp-concat';
import source from 'vinyl-source-stream';
import replace from 'gulp-replace';
import sass from 'gulp-sass';
import streamSeries from 'stream-series';
import eslint from 'gulp-eslint';

function gulpScripts() {
    console.log('Gulping scripts...');
    gulp.src([
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
        ])
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('build'));

    browserify('app/src/index.js')
        .transform(babelify, { presets: ["es2015", "react"] })
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('build'));
}

function gulpStyles() {
    console.log('Gulping styles...');
    var css = gulp.src([
            'node_modules/bootstrap/dist/css/bootstrap*.min.css',
            'node_modules/font-awesome/css/font-awesome.min.css',
            'node_modules/pretty-checkbox/src/pretty.min.css',
        ])
        .pipe(replace(/url\(\'\.\.\/fonts\//g, 'url(\'fonts/'))
        .pipe(concat('vendor.css'));

    var scss = gulp.src(['app/styles/**/*.scss'])
        .pipe(sass())
        .pipe(concat('_app.css'));

    streamSeries(css, scss)
        .pipe(concat('app.css'))
        .pipe(gulp.dest('build'));
}

function gulpFonts() {
    console.log('Gulping fonts...');
    gulp.src([
            'node_modules/font-awesome/fonts/fontawesome-webfont.woff',
            'node_modules/font-awesome/fonts/fontawesome-webfont.woff2'
        ])
        .pipe(gulp.dest('build/fonts'));
}

function gulpImages() {
    console.log('Gulping images...');
    gulp.src([
            'app/images/**/*.*'
        ])
        .pipe(gulp.dest('build/images'));    
}

function gulpHtml() {
    console.log('Gulping html...');
    gulp.src("app/**/*.html")
        .pipe(gulp.dest('build'));
}

gulp.task('build', () => {
    gulpScripts();
    gulpStyles();
    gulpFonts();
    gulpImages();
    gulpHtml();

    gulp.watch('app/src/**', () => gulpScripts());
    gulp.watch('app/styles/**', () => gulpStyles());
});

gulp.task('lint', function () {
    gulp.src('app/src/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format());
});