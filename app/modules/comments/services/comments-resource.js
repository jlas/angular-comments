'use strict';

angular.module('comments')
  .factory('Comments', function ($http, $resource) {
    return $resource('/api/comments/:id', { id: '@id'});
  });
