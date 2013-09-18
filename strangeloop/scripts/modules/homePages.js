angular.module('databus.homePages', ['ngRoute', 'databus.config'])
  .config(function($routeProvider, TPL_PATH) {
    $routeProvider
      .when('/', {
        templateUrl: TPL_PATH + '/home.html',
        controller: 'HomeCtrl'
      })
  })
  .controller('HomeCtrl', function() {
  })
