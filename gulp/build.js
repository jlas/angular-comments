'use strict';

var gulp = require('gulp');
var path = require('path');
var stylus = require('gulp-stylus');
var _ = require('lodash');
var nib = require('nib');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var gitrev = require('git-rev');
var Q = require('q');

var util = require('./util');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license']
});


// Favicon
//

gulp.task('favicon', function() {
  return gulp.src('app/favicon.ico')
    .pipe(gulp.dest('shell-dist'));
});


// JSHint
//

function jshint(failOnErr) {
  return function () {

    var reporter = $.jshint.reporter($.jshintStylish);
    if (failOnErr) {
      reporter.pipe($.jshint.reporter('fail'));
    }
    return gulp.src('app/modules/**/*.js')
      .pipe($.jshint())
      .pipe(reporter)
      .pipe($.size());
  };
}
gulp.task('jshint', jshint(true));
gulp.task('jshint:nofail', jshint(false));


// Styles
//

gulp.task('bootstrap-stylus', function() {
  return gulp.src('app/modules/common-styles/bootstrap-custom.styl')
    .pipe($.stylus({
      use: [nib()],
      errors: true,
      linenos: true,
      compress: false,
      include: ['app/modules/common-styles', 'app/bower_components/bootstrap-stylus/stylus']
    }))
    .pipe(gulp.dest('app/shell-static/styles'))
    .pipe($.size());
});

function styles(module) {
  return gulp.src(util.modStyles(module))
    .pipe($.stylus({
      errors: true,
      include: 'app/modules/common-styles'
    }))
    .pipe($.autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe($.concat('main.css'))
    .pipe(gulp.dest(path.join('app', module + '-static', 'styles')))
    .pipe($.size());
}
gulp.task('styles', ['bootstrap-stylus'], _.wrap('shell', styles));


// Scripts
//

/**
 * Load JavaScript files into index.html in the appropriate order.
 * NOTE: The result index.html file should be checked into git after being
 * modified with any newly added scripts.
 */
function scripts(module) {
  var sorted = gulp.src(util.modScripts(module))
    .pipe($.order([
      '**/index.js',
      'app/modules/**/*.js'
    ]));

    return gulp.src(path.join('app', module + '.html'))
      .pipe($.inject(sorted, {
        read: false,
        starttag: '<!-- inject:scripts -->',
        addRootSlash: false,
        ignorePath: 'app/'
      }))
      .pipe(gulp.dest('app'))
      .pipe($.rename('index.html'))
      .pipe(gulp.dest(path.join('app', module + '-static')))
      .pipe($.size());
}
gulp.task('scripts', _.wrap('shell', scripts));


// Partials
//

function partials(module) {
  return gulp.src(util.modPartials(module), {cwdbase: true})
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.ngHtml2js({
      moduleName: 'partials',
      stripPrefix: 'app/'
    }))
    .pipe($.concat('partials.min.js'))
    .pipe(gulp.dest(path.join('app', module + '-static', 'partials')))
    .pipe($.size());
}
gulp.task('partials', _.wrap('shell', partials));


// Final HTML
//

function _finalHtml(module, revision) {
  var assets;
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return gulp.src(path.join('app', module + '.html'))
    .pipe($.inject(gulp.src(
      path.join('app', module + '-static', 'partials', '*.js')), {
        read: false,
        starttag: '<!-- inject:partials -->',
        addRootSlash: false,
        ignorePath: 'app/'
      }))
    .pipe($.inject(gulp.src(
      path.join('app', module + '-static', 'styles', '*.css')), {
        read: false,
        starttag: '<!-- inject:css -->',
        addRootSlash: false,
        ignorePath: 'app/'
      }))
    .pipe($.rename('index.html'))
    .pipe(assets = $.useref.assets())
    .pipe($.rev())

    // JS pipeline
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe(jsFilter.restore())

    // CSS pipeline
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())

    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe($.replace('VERSION_PLACEHOLDER', revision))
    .pipe(gulp.dest(module + '-dist'))
    .pipe($.size());
}

function finalHtml(module) {
  var deferred = Q.defer();

  gitrev.short(function(rev) {
    _finalHtml(module, rev)
      .on('finish', function() {
        deferred.resolve();
      });
  });

  return deferred.promise;
}

gulp.task('final-html', ['styles', 'scripts', 'partials', 'fonts'], _.wrap('shell', finalHtml));


// Images
//

function images(module) {
  return gulp.src(util.modImages(module))
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(module + '-dist/images'))
    .pipe($.size());
}

gulp.task('images', _.wrap('shell', images));


// Fonts
//

function fonts(module) {
  return gulp
    .src(util.modFonts(module)
         .concat('app/bower_components/bootstrap-stylus/**/*.{eot,svg,ttf,woff}')
         .concat('app/bower_components/font-awesome/**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('app/' + module + '-static/fonts/'))
    .pipe(gulp.dest(module + '-dist/fonts/'))
    .pipe($.size());
}

gulp.task('fonts', _.wrap('shell', fonts));

gulp.task('clean', function () {
  return gulp.src(['app/*static', '*dist'], { read: false }).pipe(vinylPaths(del));
});

gulp.task('build', ['jshint:nofail', 'favicon', 'final-html']);
