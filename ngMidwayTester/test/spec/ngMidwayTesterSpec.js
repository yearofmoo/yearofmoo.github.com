describe('ngMidwayTester', function() {

  var tester,
      noop = angular.noop,
      appName = 'MyMod';

  afterEach(function() {
    tester.destroy();
    tester = null;
  });

  it('should register a module', function() {
    var example = angular.module(appName, [])
      .run(function($rootScope) {
        $rootScope.value = 'true';
      });

    tester = ngMidwayTester(appName);
    expect(tester.module()).to.equal(example);
    expect(tester.rootScope().value).to.equal('true');
  });

  it('should inject services', function() {
    var $location, $window, $compile, $injector;
    var example = angular.module(appName, [])
      .run(function(_$compile_, _$window_, _$location_, _$injector_) {
        $location = _$location_;
        $window = _$window_;
        $compile = _$compile_;
        $injector = _$injector_;
      });

    tester = ngMidwayTester(appName);
    expect(tester.injector()).to.equal($injector);
    expect(tester.inject('$location')).to.equal($location);
    expect(tester.inject('$compile')).to.equal($compile);
    expect(tester.inject('$window')).to.equal($window);
  });

  describe('template options', function() {
    it('should use a custom index.html template string', function(done) {
      var example = angular.module(appName, ['ngRoute'])
        .run(function($rootScope) {
          $rootScope.value = 'true';
        })
        .config(function($routeProvider) {
          $routeProvider.when('/path2', {
            controller: function($scope) {
              $scope.page = 'two'; 
            },
            template : 'two'
          });
        });

      tester = ngMidwayTester(appName, {
        template : '<h1>title</h1>' +
                   '<div ng-view></div>'
      });
      expect(tester.module()).to.equal(example);
      expect(tester.rootScope().value).to.equal('true');

      tester.visit('/path2', function() {
        expect(tester.path()).to.equal('/path2');
        expect(tester.viewElement().text()).to.contain('two');
        done();
      });
    });

    it('should use a custom index.html template file', function(done) {
      var example = angular.module(appName, ['ngRoute'])
        .run(function($rootScope) {
          $rootScope.value = 'true';
        })
        .config(function($routeProvider) {
          $routeProvider.when('/path-10', {
            controller: function($scope) {
              $scope.page = 'ten'; 
            },
            template : 'ten'
          });
        });

      tester = ngMidwayTester(appName, {
        templateUrl : './test/spec/custom-view.html'
      });

      expect(tester.module()).to.equal(example);
      expect(tester.rootScope().value).to.equal('true');

      tester.visit('/path-10', function() {
        expect(tester.path()).to.equal('/path-10');
        expect(tester.viewElement().text()).to.contain('ten');
        done();
      });
    });
  });

  describe('scope', function() {
    it('should perform an eval async operation', function() {
      var example = angular.module(appName, [])
        .run(function($rootScope) {
          $rootScope.value = 1;
        });

      tester = ngMidwayTester(appName);
      tester.evalAsync(function() {
        tester.rootScope().value = 2;
      });

      expect(tester.rootScope().value).to.equal(1);
      tester.digest();
      expect(tester.rootScope().value).to.equal(2);
    });

    it('should compile and link html code', function() {
      var example = angular.module(appName, [])
        .run(function($rootScope) {
          $rootScope.value = 'one';
        });

      tester = ngMidwayTester(appName);
      var element = tester.compile('<div>{{ value }}</div>');
      expect(element.html()).not.to.equal('one');
      tester.digest();
      expect(element.html()).to.equal('one');
    });
  });

  describe('routing', function() {
    it('should change the path', function(done) {
      var example = angular.module(appName, ['ngRoute'])
        .run(function($rootScope) {
          $rootScope.value = 'true';
        });

      tester = ngMidwayTester(appName, true);
      tester.visit('/', function() {
        expect(tester.path()).to.equal('/');
        done();
      });
    });

    it('should update the when by the time the callback is called', function(done) {
      var example = angular.module(appName, ['ngRoute'])
        .config(function($routeProvider) {
          $routeProvider.when('/path', {
            controller: function($scope) {
              $scope.page = 'one'; 
            },
            template : '...'
          });
          $routeProvider.when('/path2', {
            controller: function($scope) {
              $scope.page = 'two'; 
            },
            template : '==='
          });
        });

      tester = ngMidwayTester(appName, true);
      tester.attach();

      tester.visit('/path', function() {
        expect(tester.path()).to.equal('/path');
        expect(tester.rootElement().text()).to.equal('...');
        expect(tester.viewScope().page).to.equal('one');

        tester.visit('/path2', function() {
          expect(tester.path()).to.equal('/path2');
          expect(tester.rootElement().text()).to.equal('===');
          expect(tester.viewScope().page).to.equal('two');

          done();
        });
      });
    });
  });

  describe('controllers', function() {
    var example, newScope;

    beforeEach(function() {
      example = angular.module(appName, [])
        .factory('factory', function() {
          return function() {
            return 'hello';
          }
        })
        .controller('HomeCtrl', function($scope, factory) {
          $scope.factory = factory;
        });

      tester = ngMidwayTester(appName, true);
      newScope = tester.rootScope().$new();
    });

    it('should execute the controller without having to provide any locals other than the scope', function() {
      tester.controller('HomeCtrl', {
        $scope : newScope
      });
      expect(newScope.factory()).to.equal('hello');
    });

    it('should allow for mocking of other services too', function() {
      tester.controller('HomeCtrl', {
        $scope : newScope,
        factory : function() {
          return 'jello';
        }
      });
      expect(newScope.factory()).to.equal('jello');
    });
  });

});
