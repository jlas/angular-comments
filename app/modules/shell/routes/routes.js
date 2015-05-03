'use strict';

var app = angular.module('shell');

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    $stateProvider
      .state('shell', {
        url: '/home',
        templateUrl: 'modules/shell/partials/home.html'
      });
  });
