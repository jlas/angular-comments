'use strict';

var fs = require('fs');
var path = require('path');
var u = require('uglify-js');
var _ = require('lodash');

module.exports = (function() {

  var that = {};

  var moddir = path.join('app', 'modules');

  // Reads the index.js file in a module directory and finds any strings
  // in that file. We form an array of strings that are modules, then
  // recursively find the dependencies of those modules.
  function findDeps(modname) {
    var modfile = path.join(moddir, modname, 'index.js');
    var nextToken = u.tokenizer(fs.readFileSync(modfile).toString());
    var next = nextToken();
    var strings = [];
    while (next.type !== 'eof') {
      if (next.type === 'string') {
        strings.push(next.value);
      }
      next = nextToken();
    }

    // Remove any string that is not a module name in the modules directory
    var modules = fs.readdirSync(moddir);
    strings = strings.filter(function(str) {
      return (modules.indexOf(str) !== -1);
    });

    // Recurisvily find dependencies of dependencies
    var tmpStrings = strings.slice();
    strings = tmpStrings.reduce(function(prev, cur, idx) {
      if (cur !== modname) {
        return prev.concat(findDeps(cur));
      }
      return prev;
    }, strings);

    return _.uniq(strings);
  }

  // Find static assets for module and its dependants
  function expandAssets(module, glob) {
    return findDeps(module).map(function(mod) {
      return path.join(moddir, mod, glob);
    });
  }

  that.modStyles = function(module) {
    return expandAssets(module, path.join('styles', '**', '*.styl'));
  };

  that.modPartials = function(module) {
    return expandAssets(module, path.join('**', '*.html'));
  };

  that.modScripts = function(module) {
    return expandAssets(module, path.join('**', '*.js'));
  };

  that.modFonts = function(module) {
    return expandAssets(module, path.join('fonts', '**', '*.{eot,svg,ttf,woff}'));
  };

  that.modImages = function(module) {
    return expandAssets(module, path.join('images', '*'));
  };

  return that;
})();
