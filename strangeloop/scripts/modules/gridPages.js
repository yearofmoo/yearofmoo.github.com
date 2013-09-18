angular.module('databus.gridPages', ['ngRoute', 'databus.config', 'databus.firebase'])

  .config(function($routeProvider, TPL_PATH) {
    var resolveGridsCollection = {
      grids : function(fetchFirebaseCollection) {
        return fetchFirebaseCollection('grids');
      }
    };

    $routeProvider
      .when('/grids', {
        templateUrl : TPL_PATH + '/grids/index.html',
        controller : 'GridIndexCtrl',
        resolve : resolveGridsCollection
      })
      .when('/grids/new', {
        templateUrl : TPL_PATH + '/grids/form.html',
        controller : 'GridFormCtrl',
        resolve : resolveGridsCollection
      })
      .when('/grids/:grid_id/edit', {
        templateUrl : TPL_PATH + '/grids/form.html',
        controller : 'GridFormCtrl',
        resolve : resolveGridsCollection
      })
      .when('/grids/:grid_id', {
        templateUrl : TPL_PATH + '/grids/show.html',
        controller : 'GridShowCtrl',
        resolve : resolveGridsCollection
      });
  })

  .controller('GridIndexCtrl', function($scope, grids) {
    $scope.grids = grids;
  })

  .controller('GridShowCtrl', function($scope, grids, $routeParams, $location, findFirebaseItemByID) {
    $scope.grids = grids;
    $scope.grid = findFirebaseItemByID($scope.grids, $routeParams.grid_id);

    if(!$scope.grid) {
      $location.path('/grids');
      return;
    }

    $scope.destroy = function() {
      $scope.grids.remove($scope.grid);
      $location.path('/grids');
    }
  })

  .controller('GridTableCtrl', function($scope, $routeParams, $location, fetchFirebaseCollection) {
    fetchFirebaseCollection('/grid-entries/'+$routeParams.grid_id)
      .then(function(entries) {
        $scope.entries = entries;
      });

    $scope.matrix = [];
    $scope.$watch('entries.length', function() {
      $scope.matrix = $scope.buildMatrix($scope.entries);
    });

    var minWidth = 5;
    var minHeight = 5;

    $scope.increaseRows = function() {
      minHeight++;
    };
    $scope.increaseColumns = function() {
      minWidth++;
    };

    $scope.buildMatrix = function(entries) {
      var width = minWidth;
      var height = minHeight;
      var matrix = [];
      angular.forEach(entries, function(entry) {
        var x = entry.x,
            y = entry.y;
        width = Math.max(x, width);
        height = Math.max(y, height);
        matrix[y] = matrix[y] || [];
        matrix[y][x] = entry;
      });

      for(var i=0;i<=height;i++) {
        matrix[i] = matrix[i] || [];
        for(var j=0;j<=width;j++) {
          matrix[i][j] = matrix[i][j] ||
            { y : i, x : j, content : "" };
        }
      }

      minWidth = Math.max(width, minWidth);
      minHeight = Math.max(height, minHeight);

      return matrix;
    };

    $scope.save = function() {
      angular.forEach($scope.matrix, function(row) {
        angular.forEach(row, function(entry) {
          if(entry.content && entry.content.length > 0) {
            entry.$id ?
              $scope.entries.update(entry) :
              $scope.entries.add(entry);
          }
          else if(entry.$id) {
            $scope.entries.remove(entry);
          }
        });
      });
    };
  })

  .controller('GridFormCtrl', function($scope, $routeParams, $location, grids, findFirebaseItemByID) {
    $scope.grids = grids;
    $scope.isNew = true;

    var id = $routeParams.grid_id;
    if(id) {
      $scope.isNew = false;
      $scope.grid = findFirebaseItemByID($scope.grids, id);

      if(!$scope.grid) {
        $location.path('/');
        return;
      }
    }

    $scope.submit = function() {
      if($scope.gridForm.$valid) {
        if($scope.grid.$id) {
          $scope.grids.update($scope.grid);
          $location.path('/grids/' + $scope.grid.$id);
        }
        else {
          $scope.grids.add($scope.grid);
          $location.path('/grids/').hash('bottom');
        }
      }
    };
  })
