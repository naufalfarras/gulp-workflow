const gulp = require('gulp');
const del = require('del');
const Fiber = require('fibers');
const cssnano = require('cssnano');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const changed = require('gulp-changed');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();

// File Path
const style_source = 'src/scss/**/*.scss';
const html_source = 'src/*.html';
const js_source = ['src/scripts/vendors/jquery-3.4.1.min.js', 'src/js/*.js'];
const assets_source = 'src/assets/**/*';
const fonts_source = 'src/fonts/**/*';
const style_dest = 'dist/css';
const html_dest = 'dist';
const js_dest = 'dist/js';
const assets_dest = 'dist/assets';
const fonts_dest = 'dist/assets/fonts';

// Using Dart Sass
sass.compiler = require('sass');

function clean() {
    return del(['dist/**', '!dist']);
}

function css() {
    const plugins = [autoprefixer(), cssnano()];
    return gulp
        .src(style_source)
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                fiber: Fiber
            }).on('error', sass.logError)
        )
        .pipe(postcss(plugins))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(style_dest))
        .pipe(browserSync.stream());
}

function html() {
    return gulp
        .src(html_source)
        .pipe(gulp.dest(html_dest))
        .pipe(browserSync.stream());
}

function js() {
    return gulp
        .src(js_source)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('app-bundle.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(js_dest))
        .pipe(browserSync.stream());
}

function fonts() {
    return gulp
        .src(fonts_source)
        .pipe(changed(fonts_dest))
        .pipe(gulp.dest(fonts_dest));
}

function assets() {
    return gulp
        .src(assets_source)
        .pipe(changed(assets_dest))
        .pipe(
            imagemin([
                imagemin.gifsicle({
                    interlaced: true
                }),
                imagemin.jpegtran({
                    progressive: true
                }),
                imagemin.optipng({
                    optimizationLevel: 3
                }),
                imagemin.svgo({
                    plugins: [
                        {
                            removeViewBox: true
                        },
                        {
                            cleanupIDs: false
                        },
                        {
                            convertColors: true
                        },
                        {
                            minifyStyles: true
                        }
                    ]
                })
            ])
        )
        .pipe(gulp.dest(assets_dest));
}

function browser_sync() {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    });
}

function watchFiles() {
    gulp.watch(style_source, css);
    gulp.watch(html_source, html);
    gulp.watch(js_source, js);
    gulp.watch(assets_source, assets);
    gulp.watch(fonts_source, fonts);
}

// Individual Task
gulp.task('browser-sync', browser_sync);
gulp.task('clean', clean);
gulp.task('css', css);
gulp.task('html', html);
gulp.task('js', js);
gulp.task('assets', assets);
gulp.task('fonts', fonts);

// Gulp Default Task
gulp.task(
    'default',
    gulp.series('clean', gulp.parallel('css', 'html', 'js', 'assets', 'fonts'))
);

// Watch for File Changes
gulp.task(
    'watch',
    gulp.series('default', gulp.parallel(watchFiles, browser_sync))
);
