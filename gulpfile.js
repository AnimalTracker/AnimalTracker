var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var watch = require('gulp-watch');

// Process style --

gulp.task('less:build', function() {
  return gulp.src('./public/less/*.less')
    .pipe(less({ paths: [ path.join(__dirname, 'dist', 'vendors') ]}))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('less:watch', function() {
    gulp.watch('./public/less/**/*.less', ['less:build']);  // Watch all the .less files, then run the less task
});

// Process source --

gulp.task('serve', function () {
    gulp.start(['less:watch']);
});

gulp.task('default', ['serve']);