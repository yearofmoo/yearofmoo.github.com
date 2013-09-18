angular.module('databus.nav', ['databus.config', 'databus.firebase'])

  .directive('navExpand', function(fetchFirebaseCollection) {
    return {
      scope : {
        resource : '@navExpand'
      },
      controller : function($scope) {
        fetchFirebaseCollection($scope.resource).then(function(results) {
          $scope.results = results;
        });
        $scope.isActive = function() {

        };
      },
      link : function() {

      }
    };
  });
