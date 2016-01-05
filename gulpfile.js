var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var livereload = require('gulp-livereload');
var watch = require('gulp-watch');

gulp.task('less:build', function() {
  return gulp.src('./public/less/*.less')
    .pipe(less({ paths: [ path.join(__dirname, 'dist', 'vendors') ]}))
    .pipe(gulp.dest('./dist/css'))
    .pipe(livereload());
});

gulp.task('less:watch', function() {
    gulp.watch('./public/less/**/*.less', ['less:build']);  // Watch all the .less files, then run the less task
});