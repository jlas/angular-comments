'use strict';

// Declare partials module which is only really used in distribution mode,
// when all the angular partials are minified and encapsulated in a module
try {
  angular.module('partials');
} catch (e) {
  angular.module('partials', []);
}
