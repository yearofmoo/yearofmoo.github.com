angular.module('databus.helpers', [])

  .factory('trimTrailing', function() {
    return function(records, check) {
      var emptyIndex = null;
      angular.forEach(records, function(record, index) {
        if(!check(record)) {
          emptyIndex = emptyIndex || index;
        }
        else {
          emptyIndex = null;
        }
      });
      return records.slice(0, emptyIndex || records.length);
    }
  })

  .filter('clearEmpty', function() {
    return function(arr) {
      var array = [];
      angular.forEach(arr, function(a) {
        a && a.id >= 0 && array.push(a);
      });
      return array;
    }
  });
