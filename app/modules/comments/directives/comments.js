'use strict';

angular.module('comments')
  .directive('comments', function() {
    return {
      restrict: 'A',
      controller: 'CommentsCtrl',
      templateUrl: 'modules/comments/partials/comments.html'
    };
});
