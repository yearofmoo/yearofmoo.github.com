angular.module('databus.listPages', ['ngRoute', 'databus.config','databus.firebase'])

  .config(function($routeProvider, $locationProvider, TPL_PATH) {
    var resolveListsCollection = {
      lists : function(fetchFirebaseCollection) {
        return fetchFirebaseCollection('lists');
      }
    };

    $routeProvider
      .when('/lists', {
        templateUrl : TPL_PATH + '/lists/index.html',
        controller : 'ListIndexCtrl',
        resolve : resolveListsCollection
      })
      .when('/lists/new', {
        templateUrl : TPL_PATH + '/lists/form.html',
        controller : 'ListFormCtrl',
        resolve : resolveListsCollection
      })
      .when('/lists/:list_id/edit', {
        templateUrl : TPL_PATH + '/lists/form.html',
        controller : 'ListFormCtrl',
        resolve : resolveListsCollection
      })
      .when('/lists/:list_id', {
        templateUrl : TPL_PATH + '/lists/show.html',
        controller : 'ListShowCtrl',
        resolve : resolveListsCollection
      });
  })

  .controller('ListIndexCtrl', function($scope, lists, $anchorScroll) {
    $scope.lists = lists;
    $anchorScroll();
  })

  .controller('ListShowCtrl', function($scope, $routeParams, $location, lists, findFirebaseItemByID) {
    $scope.lists = lists;
    $scope.list = findFirebaseItemByID($scope.lists, $routeParams.list_id);

    if(!$scope.list) {
      $location.path('/');
      return;
    }

    $scope.destroy = function() {
      $scope.lists.remove($scope.list);
      $location.path('/lists');
    }
  })

  .controller('ListEntriesFormCtrl', function($scope, $location, $rootScope, trimTrailing, fetchFirebaseCollection) {
    fetchFirebaseCollection('list-entries/' + $scope.list.$id)
      .then(function(entries) {
        $scope.entries = entries;
      });

    $scope.submit = function() {
      angular.forEach($scope.entries, function(entry) {
        entry.isUpdated = false;
        hasContent(entry) ?
          $scope.entries.update(entry) :
          $scope.entries.remove(entry);
      });

      if(hasContent($scope.newEntry)) {
        $scope.entries.add($scope.newEntry);
        $scope.newEntry = null;
      }
    };

    function hasContent(entry) {
      return entry && entry.content && entry.content.length > 0;
    };
  })

  .controller('ListFormCtrl', function($scope, $routeParams, $location, lists, findFirebaseItemByID) {
    $scope.lists = lists;
    $scope.newList = true;

    var id = $routeParams.list_id;
    if(id) {
      $scope.newList = false;
      $scope.list = findFirebaseItemByID($scope.lists, id);

      if(!$scope.list) {
        $location.path('/');
        return;
      }
    }

    $scope.submit = function() {
      if($scope.listForm.$valid) {
        if($scope.list.$id) {
          $scope.lists.update($scope.list);
          $location.path('/lists/' + $scope.list.$id);
        }
        else {
          $scope.lists.add($scope.list);
          $location.path('/lists/').hash('bottom');
        }
      }
    };
  })
