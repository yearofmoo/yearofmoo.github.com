angular.module('databus.mapPages', ['ngRoute', 'databus.config','databus.firebase'])

  .config(function($routeProvider, $locationProvider, TPL_PATH) {
    var resolveMapsCollection = {
      maps : function(fetchFirebaseCollection) {
        return fetchFirebaseCollection('maps');
      }
    };

    $routeProvider
      .when('/maps', {
        templateUrl : TPL_PATH + '/maps/index.html',
        controller : 'MapIndexCtrl',
        resolve : resolveMapsCollection
      })
      .when('/maps/new', {
        templateUrl : TPL_PATH + '/maps/form.html',
        controller : 'MapFormCtrl',
        resolve : resolveMapsCollection
      })
      .when('/maps/:map_id/edit', {
        templateUrl : TPL_PATH + '/maps/form.html',
        controller : 'MapFormCtrl',
        resolve : resolveMapsCollection
      })
      .when('/maps/:map_id', {
        templateUrl : TPL_PATH + '/maps/show.html',
        controller : 'MapShowCtrl',
        resolve : resolveMapsCollection
      });
  })

  .controller('MapIndexCtrl', function($scope, maps) {
    $scope.maps = maps;
  })

  .controller('MapShowCtrl', function($scope, $routeParams, $location, maps, findFirebaseItemByID) {
    $scope.maps = maps;
    $scope.map = findFirebaseItemByID($scope.maps, $routeParams.map_id);

    if(!$scope.map) {
      $location.path('/maps');
      return;
    }

    $scope.destroy = function() {
      $scope.maps.remove($scope.map);
      $location.path('/maps');
    }
  })

  .controller('MapCanvasCtrl', function($scope, geoLocate, geoSearch, fetchFirebaseCollection) {
    $scope.markers = [];
    fetchFirebaseCollection('map-markers/'+ $scope.map.$id)
      .then(function(markers) {
        $scope.markers = markers;
      });

    $scope.findMe = function() {
      geoLocate().then(function(geo) {
        $scope.setCenter(geo.coords);
      }, function() {
        alert('unable to find your location...'); 
      });
    };

    $scope.search = function(q) {
      geoSearch(q).then(function(data) {
        var loc = data.geometry.location;
        $scope.setCenter({
          latitude : !isNaN(loc.latitude) ? loc.latitude : loc.ob,
          longitude : !isNaN(loc.longitude) ? loc.latitude : loc.pb
        });
      });
    };

    $scope.setCenter = function(coords) {
      $scope.center = coords;
    };

    $scope.remove = function(marker) {
      $scope.markers.remove(marker);
    };

    $scope.setCenter({
      latitude: 40.750589,
      longitude: -73.993430
    });

    $scope.zoom = 10;
  })

  .controller('MapMarkersCtrl', function($scope) {
    $scope.$on('mapClick', function(event, lat, lng) {
      $scope.placeMarker(lat, lng);
    });

    $scope.placeMarker = function(lat, lng) {
      $scope.$apply(function() {
        $scope.currentMarker = { latitude:lat, longitude:lng };
        $scope.$broadcast('placeMarker', lat, lng);
      });
    };

    $scope.clearMarker = function() {
      $scope.currentMarker = null;
      $scope.$broadcast('clearMarker');
    };

    $scope.submit = function() {
      var marker = $scope.currentMarker;
      if(marker) {
        $scope.markers.add(marker);
        $scope.setCenter(marker);
        $scope.clearMarker();
      }
    };
  })

  .directive('googleMap', function() {
    return function($scope, element, attrs) {
      var map = new google.maps.Map(element[0], {
        zoom : $scope.zoom,
        draggable: attrs.draggable,
        mapTypeId : google.maps.MapTypeId.ROADMAP
      });

      $scope.$watch(attrs.center, function(val) {
        val && map.setCenter(new google.maps.LatLng(val.latitude, val.longitude));
      });

      $scope.$watch(attrs.zoom, function(val) {
        val && map.setZoom(parseInt(val));
      });

      var currentMarkers = [];
      $scope.$watchCollection('markers', function(markers) {
        angular.forEach(currentMarkers, removeMarker);

        currentMarkers = [];
        angular.forEach(markers, function(marker) {
          currentMarkers.push(addMarker(map, marker.latitude, marker.longitude, marker.title));
        });
      });

      google.maps.event.addListener(map, 'click', function(e) {
        var lat = e.latLng.ob;
        var lng = e.latLng.pb;
        $scope.$emit('mapClick', lat, lng);
      });

      var marker;
      $scope.$on('placeMarker', function(event, lat, lng, title) {
        removeMarker(marker);
        marker = addMarker(map, lat, lng, title, true);
      });

      $scope.$on('clearMarker', function(event, lat, lng) {
        removeMarker(marker);
        marker = null;
      });

      function removeMarker(marker) {
        marker && marker.setMap(null);
      }

      function addMarker(map, lat, lng, title, draggable) {
        return new google.maps.Marker({
          title:title,
          position: new google.maps.LatLng(lat, lng),
          draggable: draggable,
          map: map
        });
      }
    };
  })

  .controller('MapFormCtrl', function($scope, $routeParams, $location, maps, findFirebaseItemByID) {
    $scope.maps = maps;
    $scope.isNew = true;

    var id = $routeParams.map_id;
    if(id) {
      $scope.isNew = false;
      $scope.map = findFirebaseItemByID($scope.maps, id);

      if(!$scope.map) {
        $location.path('/maps');
        return;
      }
    }

    $scope.submit = function() {
      if($scope.mapForm.$valid) {
        var method = $scope.map.$id ? 'update' : 'add';
        $scope.maps[method]($scope.map, function() {
          $scope.$apply(function() {
            var map = $scope.map.$id ?
              $scope.map :
              $scope.maps[$scope.maps.length-1];
            $location.path('/maps/' + map.$id);
          });
        });
      }
    };
  })

  .factory('geoLocate', function($window, $q) {
    return function() {
      var defer = $q.defer();

      if($window.navigator.geolocation) {
        $window.navigator.geolocation.getCurrentPosition(onReady, onFailure);
      }
      else {
        $rootScope.$evalAsync(onFailure);
      }
      
      return defer.promise;

      function onReady(coords) {
        defer.resolve(coords);
      };

      function onFailure() {
        defer.reject();
      }
    };
  })

  .factory('geoSearch', function($q) {
    var geocoder = new google.maps.Geocoder();
    return function(q) {
      var defer = $q.defer();
      geocoder.geocode({ 'address': q }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          defer.resolve(results[0]);
        }
        else {
          defer.reject();
        }
      });
      return defer.promise;
    };
  });
