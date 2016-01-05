var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var watch = require('gulp-watch');
var eslint = require('gulp-eslint');

// Process style --

gulp.task('less:build', function() {
  return gulp.src('./public/less/*.less')
    .pipe(less({ paths: [ path.join(__dirname, 'dist', 'vendors') ]}))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('less:watch', function() {
    gulp.watch('./public/less/**/*.less', ['less:build']);  // Watch all the .less files, then run the less task
});

// Process scripts --

gulp.task('scripts:build', function() {
  return gulp.src('./public/js/*.js')
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError())
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('scripts:watch', function() {
  gulp.watch('./public/js/**/*.js', ['script:build']);  // Watch all the .less files, then run the less task
});

// Process source --

gulp.task('serve', function () {
  gulp.start(['less:watch', 'scripts:watch']);
});

gulp.task('default', ['serve']);