const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imageMin = require('gulp-imagemin');
// const cached = require('gulp-cached');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');


// const del = require('del');
const del = require('gulp-clean');

// function cleanDist() {
//   return del('dist')
// }

function cleanDist() {
  return src('dist')
    .pipe(del())
}

function html() {
  return src('src/html/*.html')
    .pipe(include({
      includePaths: 'src/html/components'
    }))
    .pipe(dest('src'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src([
    'src/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('src/js'))
    .pipe(browserSync.stream())
}

function styles() {
  return src('src/scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(scss().on('error', scss.logError))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'],
      grid: true
    }))
    .pipe(concat('style.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('src/css'))
    .pipe(browserSync.stream())
}

function images() {
  return src(['src/assets/images/*.*', '!src/assets/images/*.svg'])
    .pipe(newer('src/assets/images/dist'))
    .pipe(avif({ quality: 50 }))
    .pipe(src('src/images/*.*'))
    .pipe(newer('src/assets/images/dist'))
    .pipe(webp())
    .pipe(src('src/images/*.*'))
    .pipe(newer('src/assets/images/dist'))
    .pipe(imageMin())
    .pipe(dest('src/assets/images/dist'))
}

function sprite() {
  return (src('src/assets/dist/*.svg'))
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
          example: true
        }
      }
    }))
    .pipe(dest('src/assets/images/dist'))
}

function watching() {
  browserSync.init({
    server: {
      baseDir: 'src/html'
    }
  });
  watch(['src/scss/**/*.scss'], styles);
  watch(['src/assets/images'], images);
  watch(['src/html/*', 'src/html/components/*'], html);
  watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts);
  watch(['src/**/*.html']).on('change', browserSync.reload);
}

function building() {
  return src([
    'src/css/style.min.css',
    'src/asset/fonts/**/*',
    'src/asset/images/dist/*.*',
    'src/js/main.min.js',
    'src/html/*.html',
  ], { base: 'src' })
    .pipe(dest('dist'))
}

exports.styles = styles;
exports.watching = watching;
exports.scripts = scripts;
exports.html = html;
exports.cleanDist = cleanDist;
exports.imageMin = imageMin;
exports.sprite = sprite;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, images, scripts, html, watching);


