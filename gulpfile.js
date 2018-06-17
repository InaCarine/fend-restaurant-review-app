// stops eslint from throwing errors in this file
/* eslint-env node */

var gulp = require('gulp');

// Build optimization
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

// Transpiler
const babel = require('gulp-babel');

// Other
const browserSync = require('browser-sync').create();

// run: gulp watch
// Watches for file changes and refreshes the browser on save
gulp.task('watch', function (done) {
  gulp.watch('src/sass/**/*.scss', gulp.series('sass')).on('change', browserSync.reload);
  gulp.watch('src/*.html', gulp.series('copy-html'));
  gulp.watch('src/js/**/*.js', gulp.series('scripts')).on('change', browserSync.reload);
  gulp.watch('dist/*.html').on('change', browserSync.reload);

  browserSync.init({
    server: 'dist/',
    port: 8887
  });

  done();
});

// For updating html files
// run gulp copy-html
gulp.task('copy-html', function (done) {
  gulp.src('src/*.html')
    .pipe(gulp.dest('dist/'));
  done();
});

// For transpiling and optimizing scripts
// run: gulp scripts
gulp.task('scripts', function (done) {
  gulp.src('src/js/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/js'));
  done();
});

// to minify css, change expanded to compressed
// run: gulp sass
gulp.task('sass', function () {
  return gulp.src('src/sass/**/*.scss')
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream({ match: '**/*.css' }));
});

