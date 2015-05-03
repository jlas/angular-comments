'use strict';

angular.module('comments')
  .controller('CommentsCtrl', function ($scope, Comments) {
    Comments.query(function(response) {
      $scope.comments = response;
    }, function(err) {
      console.log('ERROR:', err);
    });

    // Helper function to generate some fake comment data
    function makeCommentData(newComment) {
      return {
        'id': '4',
        'user': {
          'id': '4',
          'img_src': '/mock/images/user-img-4.png',
          'full_name': 'John Doe',
          'title': 'Designer'
        },
        'comment': {
          'description': newComment,
          'date_posted': 'Mon July 10th'
        }
      };
    }

    $scope.addComment = function(newComment) {
      var commentData = makeCommentData(newComment);
      Comments.save({}, commentData, function() {
        $scope.comments.splice(0, 0, commentData);
        $scope.newComment = '';
      }, function(err) {
        console.log('ERROR:', err);
      });
    };
  });
