var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var watch = require('gulp-watch');
var eslint = require('gulp-eslint');

// Options --
// ESlint configuration : eslint.org/docs/user-guide/configuring
// Rules : http://eslint.org/docs/rules/
// How to use rules : http://eslint.org/docs/user-guide/configuring#configuring-rules

eslintOptionsBrowser = {
  extends: 'eslint:recommended',
  ecmaFeatures: {
    'modules': false
  },
  rules: {
    'no-unused-vars': 1,  // Warning
    'no-console': 1       // Warning
  },
  globals: {
    'jQuery':false,
    '$':true
  },
  envs: [
    'browser'
  ]
};

eslintOptionsServer = {
  extends: 'eslint:recommended',
  ecmaFeatures: {
    'modules': true
  },
  rules: {
    'no-unused-vars': 1,  // Warning
    'no-console': 0,      // Off
  },
  globals: {
  },
  envs: [
    'node'
  ]
};

// Process style --

gulp.task('less:build', function() {
  return gulp.src('./public/less/*.less')                               // Take all stylesheets as Less
    .pipe(less({ paths: [ path.join(__dirname, 'dist', 'vendors') ]}))  // Convert into CSS
    .pipe(gulp.dest('./dist/css'));                                     // Store the result in dist
});

gulp.task('less:watch', ['less:build'], function() {
  // Watch all the .less files, then run the less task
  gulp.watch('./public/less/**/*.less', ['less:build']);
});

// Process scripts --

gulp.task('scripts:build', function() {
  return gulp.src('./public/js/*.js')   // Take all browser sources files
    .pipe(eslint(eslintOptionsBrowser)) // Check
    .pipe(eslint.format())              // Display
    .pipe(eslint.failAfterError())      // Cut the flow if a mistake has been found
    .pipe(gulp.dest('./dist/js'));      // Store the result in dist
});

gulp.task('scripts:watch', ['scripts:build'], function() {
  // Watch all the browser.js files, then run the build task
  gulp.watch('./public/js/**/*.js', ['script:build']);
});

// Process source --

gulp.task('src:lint', function() {
  return gulp.src(['./src/**/*.js', 'app.js'])  // Take all server sources files
    .pipe(eslint(eslintOptionsServer))          // Check
    .pipe(eslint.format());                     // Display
});

gulp.task('src:watch', ['src:lint'], function() {
  // Watch all the server source files, then run the lint task
  gulp.watch(['./src/**/*.js', 'app.js'], ['src:lint']);
});

// High level tasks --

gulp.task('watch', function () {
  gulp.start([
    'less:build',
    'scripts:build',
    'src:lint',
    'less:watch',
    'scripts:watch',
    'src:watch']);
});

gulp.task('default', ['watch']);