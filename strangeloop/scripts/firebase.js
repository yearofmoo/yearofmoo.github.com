angular.module('databus.firebase', ['firebase', 'databus.config'])

  .factory('findFirebaseItemByID', function(findFirebaseItem) {
    return function(collection, id) {
      return findFirebaseItem(collection, function(item) {
        return item.$id == id;
      });
    }
  })

  .factory('findFirebaseItem', function() {
    return function(collection, exp) {
      for(var i=0; i < collection.length; i++) {
        var c = collection[i];
        if(exp(c)) return c;
      }
    }
  })

  .factory('fetchFirebaseCollection', function(angularFireCollection, $q, $rootScope, FIREBASE_URI) {
    var firebaseCache = {};
    return function(path) {
      var defer = $q.defer();
      var collection = firebaseCache[path];
      if(collection) {
        $rootScope.$evalAsync(function() {
          defer.resolve(collection);
        });
      }
      else {
        var ref = new Firebase(FIREBASE_URI + path);
        collection = angularFireCollection(ref, function() {
          firebaseCache[path] = collection;
          defer.resolve(collection);
        });
      }
      return defer.promise;
    };
  })
