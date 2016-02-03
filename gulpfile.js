var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var watch = require('gulp-watch');
var eslint = require('gulp-eslint');
var plumber = require('gulp-plumber');
var stripJsonComments = require('gulp-strip-json-comments');

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
    'no-fallthrough': 1   // Warning
  },
  globals: {
  },
  envs: [
    'node',
    'es6'
  ]
};

// Process style --

gulp.task('less:build', function() {
  return gulp.src('./assets/less/*.less')                                 // Take all stylesheets as Less
    .pipe(less({ paths: [ path.join(__dirname, 'public', 'vendors') ]}))  // Convert into CSS
    .pipe(gulp.dest('./public/css'));                                     // Store the result in public
});

gulp.task('less:watch', ['less:build'], function() {
  // Watch all the .less files, then run the less task
  gulp.watch('./assets/less/**/*.less', ['less:build']);
});

// Process scripts --

gulp.task('scripts:build', function() {
  return gulp.src('./assets/js/**/*.js')     // Take all browser sources files
  //.pipe(plumber())                      // Security
    .pipe(eslint(eslintOptionsBrowser))   // Check
    .pipe(eslint.format())                // Display
  //.pipe(eslint.failAfterError())        // Cut the flow if a mistake has been found
    .pipe(gulp.dest('./public/js'));      // Store the result in public
});

gulp.task('scripts:watch', ['scripts:build'], function() {
  // Watch all the browser.js files, then run the build task
  gulp.watch('./assets/js/**/*.js', ['scripts:build']);
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

// Process other resources --

gulp.task('resource.root:build', function() {
  return gulp.src(['./assets/root/**/*']) // Take all root resources
    .pipe(gulp.dest('./public'))          // Copy in public
});

gulp.task('resource.root:watch', ['resource.root:build'], function() {
  // Watch all the root resources, then run the copy task
  gulp.watch(['/assets/root/**/*'], ['resource.root:build']);
});

// DT language files --

gulp.task('lang:build', function () {
  return gulp.src('./public/vendors/datatables-plugins/i18n/*.lang')
    .pipe(stripJsonComments())
    .pipe(gulp.dest('./public/i18n/datatables/'));
});

// High level tasks --

gulp.task('build', function () {
  gulp.start([
    'less:build',
    'scripts:build',
    'resource.root:build',
    'lang:build'
  ]);
});

gulp.task('watch', function () {
  gulp.start([
    'build',
    'src:lint',
    'less:watch',
    'scripts:watch',
    'src:watch',
    'resource.root:watch']);
});



gulp.task('default', ['watch']);