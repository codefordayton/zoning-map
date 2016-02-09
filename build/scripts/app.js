(function () {
    'use strict';

    var app = angular.module('zoningMapApp', [
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'emguo.poller',
        'ui.bootstrap',
        'ui.grid',
        'ui.grid.selection',
        'ui.grid.pagination',
        'ui.grid.resizeColumns',
        'cfp.hotkeys',
        'nemLogging',
        'ui-leaflet'
    ]);

    app.config(['$routeProvider', '$resourceProvider', 'pollerConfig', function($routeProvider, $resourceProvider, pollerConfig) {
        // stop pollers when route changes
        pollerConfig.stopOnRouteChange = true;
        pollerConfig.smart = true;

        // preserve trailing slashes
        $resourceProvider.defaults.stripTrailingSlashes = false;

        //routing
        $routeProvider
            .when('/', {
                controller: 'mapController',
                templateUrl: 'modules/map/partials/mapTemplate.html'
            })
            .when('/about', {
              controller: 'aboutController',
              templateUrl: 'modules/about/partials/aboutTemplate.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .value('moment', window.moment)
    .value('localStorage', window.localStorage)
    .value('L', window.L);
})();

(function () {
    'use strict';

    angular.module('zoningMapApp').service('zoningMapConfig', function () {

        var cfg = {
          colors: {
            emo_1: '#556270',
            emo_2: '#4ecdc4',
            emo_3: '#c7f464',
            emo_4: '#ff6b6b',
            emo_5: '#c44d58',

            va_1: '#f2385a',
            va_2: '#f5a503',
            va_3: '#e9f1df',
            va_4: '#4ad9d9',
            va_5: '#3681bf',

            df_1: '#566669',
            df_2: '#bfe2ff',
            df_3: '#0a131a',
            df_4: '#122031',
            df_5: '#00010d',

            chart_blue: '#589ad0',
            chart_gray: '#cccccc',
            chart_gray_dark: '#aaaaaa',
            chart_green: '#8fca0e',
            chart_orange: '#ff7730',
            chart_purple: '#bf81bf',
            chart_red: '#f54d36',
            chart_white: '#fff',
            chart_yellow: '#ffc317',
            chart_pink: '#fb03b2',

            slate_blue_1: '#171C1C',
            slate_blue_2: '#0F181C',

            nav_bg: 'slate_blue_1',
            nav_txt: 'light',

            view_bg: 'light',
            view_txt: '#434649',

            accent_blue: 'va_5',

            patternDefault: ['#4D4D4D', '#5DA5DA', '#FAA43A', '#60BD68', '#F17CB0', '#B2912F', '#B276B2', '#DECF3F', '#F15854'],
            healthChart: ['#8fca0e', '#f54d36', '#ffc317', '#ff7730', '#3681bf', '#999999', '#d97bf9'],
            statusChart: ['#999999', '#d97bf9', '#f54d36', '#ff7730', '#8fca0e', '#ffc317', '#3681bf'],
            patternEmo: ['#556270', '#4ecdc4', '#c7f464', '#ff6b6b', '#c44d58'],
            patternVa: ['#f2385a', '#f5a503', '#e9f1df', '#4ad9d9', '#3681bf'],
            patternDf: ['#566669', '#bfe2ff', '#0a131a', '#122031', '#00010d'],
            patternD320: ['#1f77bf', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
          }
        }

        return cfg;
    });
})();

(function () {
    angular.module('zoningMapApp').service('zmService', function () {

        return {
            getViewportSize: function () {
                var w = window,
                    d = document,
                    e = d.documentElement,
                    g = document.body,
                    x = w.innerWidth || e.clientWidth || g.clientWidth,
                    y = w.innerHeight || e.clientHeight || g.clientHeight;

                return {
                    width: x,
                    height: y
                };
            },
            formatLatLng: function (value) {
                // ensure bounds values have at least 1 decimal place
                return (value % 1 === 0) ? value.toFixed(1) : value;
            }
        };
    });
})();

(function () {
  'use strict';

  angular.module('zoningMapApp').controller('mapController', ['$scope', '$http', 'zmService', 'L', 'leafletData', function($scope, $http, zmService, L, leafletData) {
    $scope.mapHeight='750px';


    angular.element(document).ready(function () {
      // set map height equal to available page height
      var viewport = zmService.getViewportSize();
      $scope.mapHeight = viewport.height + 'px';
    });

    var initialize = function() {

      leafletData.getMap().then(function (map) {
        $scope.map = map;
        // Get the countries geojson data from a JSON
        $http.get("test/data/daytonMarker.geo.json").success(function(data, status) {
          console.log(data);
          L.geoJson(data, {}).addTo(map);
        });
      });
      $scope.center = {
            lat: 39.7594,
            lng: -84.1917,
            zoom: 12
      };

      L.Icon.Default.imagePath = 'images';


    };
    initialize();
  }]);
})();

(function () {
    'use strict';

    angular.module('zoningMapApp').controller('aboutController', ['$scope', '$location', '$window', 'navigationService', function($scope, $location, $window, navigationService) {
        var initialize = function() {
            navigationService.updateLocation('about');
        };
        initialize();
    }]);
})();

(function () {
    'use strict';

    angular.module('zoningMapApp').controller('navigationController', ['$scope', '$location', '$window', 'navigationService', function($scope, $location, $window, navigationService) {

        $scope.activePage = 'map';

        $scope.goto = function(loc) {
            $location.search('');
            $location.path(loc);
        };

        var locationUpdated = function() {
            $scope.activePage = navigationService.location;
        };

        var initialize = function() {
            navigationService.registerObserver(locationUpdated);
        };
        initialize();

    }]);
})();

(function () {
    'use strict';

    angular.module('zoningMapApp').directive('zmNavigation', function () {
        return {
            restrict: 'E',
            templateUrl: 'modules/navigation/partials/navigationTemplate.html',
            controller: 'navigationController'
        };
    });
})();

(function () {
    'use strict';
    /**
     * See: http://stackoverflow.com/questions/12576798/angularjs-how-to-watch-service-variables/17558885#17558885
     * Doing things this way so that ssNavbarController can get notified
     * when the location changes. Then, our controllers just need to call into
     * this service to updateLocation.
     *
     * The only thing I don't like about this is that the individual
     * controllers have to call in and tell the ssNavigationService what
     * page they are showing.
     */
    angular.module('zoningMapApp').service('navigationService', function () {

        this.location = 'map'; // where the app starts

        var observers = [];

        this.registerObserver = function(callback) {
            observers.push(callback);
        };

        this.notifyObservers = function() {
            angular.forEach(observers, function(observer) {
                observer();
            });
        };

        this.updateLocation = function(locationIn) {
            this.location = locationIn;
            this.notifyObservers();
        };

    });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsInpvbmluZ01hcENvbmZpZy5qcyIsImNvbW1vbi9zZXJ2aWNlcy96bVNlcnZpY2UuanMiLCJtYXAvY29udHJvbGxlcnMvbWFwQ29udHJvbGxlci5qcyIsImFib3V0L2NvbnRyb2xsZXJzL2Fib3V0Q29udHJvbGxlci5qcyIsIm5hdmlnYXRpb24vY29udHJvbGxlcnMvbmF2aWdhdGlvbkNvbnRyb2xsZXIuanMiLCJuYXZpZ2F0aW9uL2RpcmVjdGl2ZXMvbmF2aWdhdGlvbkRpcmVjdGl2ZS5qcyIsIm5hdmlnYXRpb24vc2VydmljZXMvbmF2aWdhdGlvblNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBQSxZQUFBO0lBQ0E7O0lBRUEsSUFBQSxNQUFBLFFBQUEsT0FBQSxnQkFBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7O0lBR0EsSUFBQSwrREFBQSxTQUFBLGdCQUFBLG1CQUFBLGNBQUE7O1FBRUEsYUFBQSxvQkFBQTtRQUNBLGFBQUEsUUFBQTs7O1FBR0Esa0JBQUEsU0FBQSx1QkFBQTs7O1FBR0E7YUFDQSxLQUFBLEtBQUE7Z0JBQ0EsWUFBQTtnQkFDQSxhQUFBOzthQUVBLEtBQUEsVUFBQTtjQUNBLFlBQUE7Y0FDQSxhQUFBOzthQUVBLFVBQUE7Z0JBQ0EsWUFBQTs7O0tBR0EsTUFBQSxVQUFBLE9BQUE7S0FDQSxNQUFBLGdCQUFBLE9BQUE7S0FDQSxNQUFBLEtBQUEsT0FBQTs7O0FDMUNBLENBQUEsWUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxnQkFBQSxRQUFBLG1CQUFBLFlBQUE7O1FBRUEsSUFBQSxNQUFBO1VBQ0EsUUFBQTtZQUNBLE9BQUE7WUFDQSxPQUFBO1lBQ0EsT0FBQTtZQUNBLE9BQUE7WUFDQSxPQUFBOztZQUVBLE1BQUE7WUFDQSxNQUFBO1lBQ0EsTUFBQTtZQUNBLE1BQUE7WUFDQSxNQUFBOztZQUVBLE1BQUE7WUFDQSxN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O0FDUEEsQ0FBQSxZQUFBO0lBQ0E7Ozs7Ozs7Ozs7O0lBV0EsUUFBQSxPQUFBLGdCQUFBLFFBQUEscUJBQUEsWUFBQTs7UUFFQSxLQUFBLFdBQUE7O1FBRUEsSUFBQSxZQUFBOztRQUVBLEtBQUEsbUJBQUEsU0FBQSxVQUFBO1lBQ0EsVUFBQSxLQUFBOzs7UUFHQSxLQUFBLGtCQUFBLFdBQUE7WUFDQSxRQUFBLFFBQUEsV0FBQSxTQUFBLFVBQUE7Z0JBQ0E7Ozs7UUFJQSxLQUFBLGlCQUFBLFNBQUEsWUFBQTtZQUNBLEtBQUEsV0FBQTtZQUNBLEtBQUE7Ozs7O0FBS0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ3pvbmluZ01hcEFwcCcsIFtcbiAgICAgICAgJ25nUmVzb3VyY2UnLFxuICAgICAgICAnbmdTYW5pdGl6ZScsXG4gICAgICAgICduZ1JvdXRlJyxcbiAgICAgICAgJ2VtZ3VvLnBvbGxlcicsXG4gICAgICAgICd1aS5ib290c3RyYXAnLFxuICAgICAgICAndWkuZ3JpZCcsXG4gICAgICAgICd1aS5ncmlkLnNlbGVjdGlvbicsXG4gICAgICAgICd1aS5ncmlkLnBhZ2luYXRpb24nLFxuICAgICAgICAndWkuZ3JpZC5yZXNpemVDb2x1bW5zJyxcbiAgICAgICAgJ2NmcC5ob3RrZXlzJyxcbiAgICAgICAgJ25lbUxvZ2dpbmcnLFxuICAgICAgICAndWktbGVhZmxldCdcbiAgICBdKTtcblxuICAgIGFwcC5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsICRyZXNvdXJjZVByb3ZpZGVyLCBwb2xsZXJDb25maWcpIHtcbiAgICAgICAgLy8gc3RvcCBwb2xsZXJzIHdoZW4gcm91dGUgY2hhbmdlc1xuICAgICAgICBwb2xsZXJDb25maWcuc3RvcE9uUm91dGVDaGFuZ2UgPSB0cnVlO1xuICAgICAgICBwb2xsZXJDb25maWcuc21hcnQgPSB0cnVlO1xuXG4gICAgICAgIC8vIHByZXNlcnZlIHRyYWlsaW5nIHNsYXNoZXNcbiAgICAgICAgJHJlc291cmNlUHJvdmlkZXIuZGVmYXVsdHMuc3RyaXBUcmFpbGluZ1NsYXNoZXMgPSBmYWxzZTtcblxuICAgICAgICAvL3JvdXRpbmdcbiAgICAgICAgJHJvdXRlUHJvdmlkZXJcbiAgICAgICAgICAgIC53aGVuKCcvJywge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdtYXBDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ21vZHVsZXMvbWFwL3BhcnRpYWxzL21hcFRlbXBsYXRlLmh0bWwnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLndoZW4oJy9hYm91dCcsIHtcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2Fib3V0Q29udHJvbGxlcicsXG4gICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbW9kdWxlcy9hYm91dC9wYXJ0aWFscy9hYm91dFRlbXBsYXRlLmh0bWwnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm90aGVyd2lzZSh7XG4gICAgICAgICAgICAgICAgcmVkaXJlY3RUbzogJy8nXG4gICAgICAgICAgICB9KTtcbiAgICB9KVxuICAgIC52YWx1ZSgnbW9tZW50Jywgd2luZG93Lm1vbWVudClcbiAgICAudmFsdWUoJ2xvY2FsU3RvcmFnZScsIHdpbmRvdy5sb2NhbFN0b3JhZ2UpXG4gICAgLnZhbHVlKCdMJywgd2luZG93LkwpO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ3pvbmluZ01hcEFwcCcpLnNlcnZpY2UoJ3pvbmluZ01hcENvbmZpZycsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgY2ZnID0ge1xuICAgICAgICAgIGNvbG9yczoge1xuICAgICAgICAgICAgZW1vXzE6ICcjNTU2MjcwJyxcbiAgICAgICAgICAgIGVtb18yOiAnIzRlY2RjNCcsXG4gICAgICAgICAgICBlbW9fMzogJyNjN2Y0NjQnLFxuICAgICAgICAgICAgZW1vXzQ6ICcjZmY2YjZiJyxcbiAgICAgICAgICAgIGVtb181OiAnI2M0NGQ1OCcsXG5cbiAgICAgICAgICAgIHZhXzE6ICcjZjIzODVhJyxcbiAgICAgICAgICAgIHZhXzI6ICcjZjVhNTAzJyxcbiAgICAgICAgICAgIHZhXzM6ICcjZTlmMWRmJyxcbiAgICAgICAgICAgIHZhXzQ6ICcjNGFkOWQ5JyxcbiAgICAgICAgICAgIHZhXzU6ICcjMzY4MWJmJyxcblxuICAgICAgICAgICAgZGZfMTogJyM1NjY2NjknLFxuICAgICAgICAgICAgZGZfMjogJyNiZmUyZmYnLFxuICAgICAgICAgICAgZGZfMzogJyMwYTEzMWEnLFxuICAgICAgICAgICAgZGZfNDogJyMxMjIwMzEnLFxuICAgICAgICAgICAgZGZfNTogJyMwMDAxMGQnLFxuXG4gICAgICAgICAgICBjaGFydF9ibHVlOiAnIzU4OWFkMCcsXG4gICAgICAgICAgICBjaGFydF9ncmF5OiAnI2NjY2NjYycsXG4gICAgICAgICAgICBjaGFydF9ncmF5X2Rhcms6ICcjYWFhYWFhJyxcbiAgICAgICAgICAgIGNoYXJ0X2dyZWVuOiAnIzhmY2EwZScsXG4gICAgICAgICAgICBjaGFydF9vcmFuZ2U6ICcjZmY3NzMwJyxcbiAgICAgICAgICAgIGNoYXJ0X3B1cnBsZTogJyNiZjgxYmYnLFxuICAgICAgICAgICAgY2hhcnRfcmVkOiAnI2Y1NGQzNicsXG4gICAgICAgICAgICBjaGFydF93aGl0ZTogJyNmZmYnLFxuICAgICAgICAgICAgY2hhcnRfeWVsbG93OiAnI2ZmYzMxNycsXG4gICAgICAgICAgICBjaGFydF9waW5rOiAnI2ZiMDNiMicsXG5cbiAgICAgICAgICAgIHNsYXRlX2JsdWVfMTogJyMxNzFDMUMnLFxuICAgICAgICAgICAgc2xhdGVfYmx1ZV8yOiAnIzBGMTgxQycsXG5cbiAgICAgICAgICAgIG5hdl9iZzogJ3NsYXRlX2JsdWVfMScsXG4gICAgICAgICAgICBuYXZfdHh0OiAnbGlnaHQnLFxuXG4gICAgICAgICAgICB2aWV3X2JnOiAnbGlnaHQnLFxuICAgICAgICAgICAgdmlld190eHQ6ICcjNDM0NjQ5JyxcblxuICAgICAgICAgICAgYWNjZW50X2JsdWU6ICd2YV81JyxcblxuICAgICAgICAgICAgcGF0dGVybkRlZmF1bHQ6IFsnIzRENEQ0RCcsICcjNURBNURBJywgJyNGQUE0M0EnLCAnIzYwQkQ2OCcsICcjRjE3Q0IwJywgJyNCMjkxMkYnLCAnI0IyNzZCMicsICcjREVDRjNGJywgJyNGMTU4NTQnXSxcbiAgICAgICAgICAgIGhlYWx0aENoYXJ0OiBbJyM4ZmNhMGUnLCAnI2Y1NGQzNicsICcjZmZjMzE3JywgJyNmZjc3MzAnLCAnIzM2ODFiZicsICcjOTk5OTk5JywgJyNkOTdiZjknXSxcbiAgICAgICAgICAgIHN0YXR1c0NoYXJ0OiBbJyM5OTk5OTknLCAnI2Q5N2JmOScsICcjZjU0ZDM2JywgJyNmZjc3MzAnLCAnIzhmY2EwZScsICcjZmZjMzE3JywgJyMzNjgxYmYnXSxcbiAgICAgICAgICAgIHBhdHRlcm5FbW86IFsnIzU1NjI3MCcsICcjNGVjZGM0JywgJyNjN2Y0NjQnLCAnI2ZmNmI2YicsICcjYzQ0ZDU4J10sXG4gICAgICAgICAgICBwYXR0ZXJuVmE6IFsnI2YyMzg1YScsICcjZjVhNTAzJywgJyNlOWYxZGYnLCAnIzRhZDlkOScsICcjMzY4MWJmJ10sXG4gICAgICAgICAgICBwYXR0ZXJuRGY6IFsnIzU2NjY2OScsICcjYmZlMmZmJywgJyMwYTEzMWEnLCAnIzEyMjAzMScsICcjMDAwMTBkJ10sXG4gICAgICAgICAgICBwYXR0ZXJuRDMyMDogWycjMWY3N2JmJywgJyNhZWM3ZTgnLCAnI2ZmN2YwZScsICcjZmZiYjc4JywgJyMyY2EwMmMnLCAnIzk4ZGY4YScsICcjZDYyNzI4JywgJyNmZjk4OTYnLCAnIzk0NjdiZCcsICcjYzViMGQ1JywgJyM4YzU2NGInLCAnI2M0OWM5NCcsICcjZTM3N2MyJywgJyNmN2I2ZDInLCAnIzdmN2Y3ZicsICcjYzdjN2M3JywgJyNiY2JkMjInLCAnI2RiZGI4ZCcsICcjMTdiZWNmJywgJyM5ZWRhZTUnXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjZmc7XG4gICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnem9uaW5nTWFwQXBwJykuc2VydmljZSgnem1TZXJ2aWNlJywgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBnZXRWaWV3cG9ydFNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdyA9IHdpbmRvdyxcbiAgICAgICAgICAgICAgICAgICAgZCA9IGRvY3VtZW50LFxuICAgICAgICAgICAgICAgICAgICBlID0gZC5kb2N1bWVudEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgIGcgPSBkb2N1bWVudC5ib2R5LFxuICAgICAgICAgICAgICAgICAgICB4ID0gdy5pbm5lcldpZHRoIHx8IGUuY2xpZW50V2lkdGggfHwgZy5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgeSA9IHcuaW5uZXJIZWlnaHQgfHwgZS5jbGllbnRIZWlnaHQgfHwgZy5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogeCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB5XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmb3JtYXRMYXRMbmc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSBib3VuZHMgdmFsdWVzIGhhdmUgYXQgbGVhc3QgMSBkZWNpbWFsIHBsYWNlXG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSAlIDEgPT09IDApID8gdmFsdWUudG9GaXhlZCgxKSA6IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyLm1vZHVsZSgnem9uaW5nTWFwQXBwJykuY29udHJvbGxlcignbWFwQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsIHptU2VydmljZSwgTCwgbGVhZmxldERhdGEpIHtcbiAgICAkc2NvcGUubWFwSGVpZ2h0PSc3NTBweCc7XG5cblxuICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgLy8gc2V0IG1hcCBoZWlnaHQgZXF1YWwgdG8gYXZhaWxhYmxlIHBhZ2UgaGVpZ2h0XG4gICAgICB2YXIgdmlld3BvcnQgPSB6bVNlcnZpY2UuZ2V0Vmlld3BvcnRTaXplKCk7XG4gICAgICAkc2NvcGUubWFwSGVpZ2h0ID0gdmlld3BvcnQuaGVpZ2h0ICsgJ3B4JztcbiAgICB9KTtcblxuICAgIHZhciBpbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIGxlYWZsZXREYXRhLmdldE1hcCgpLnRoZW4oZnVuY3Rpb24gKG1hcCkge1xuICAgICAgICAkc2NvcGUubWFwID0gbWFwO1xuICAgICAgICAvLyBHZXQgdGhlIGNvdW50cmllcyBnZW9qc29uIGRhdGEgZnJvbSBhIEpTT05cbiAgICAgICAgJGh0dHAuZ2V0KFwidGVzdC9kYXRhL2RheXRvbk1hcmtlci5nZW8uanNvblwiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICAgIEwuZ2VvSnNvbihkYXRhLCB7fSkuYWRkVG8obWFwKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgICRzY29wZS5jZW50ZXIgPSB7XG4gICAgICAgICAgICBsYXQ6IDM5Ljc1OTQsXG4gICAgICAgICAgICBsbmc6IC04NC4xOTE3LFxuICAgICAgICAgICAgem9vbTogMTJcbiAgICAgIH07XG5cbiAgICAgIEwuSWNvbi5EZWZhdWx0LmltYWdlUGF0aCA9ICdpbWFnZXMnO1xuXG5cbiAgICB9O1xuICAgIGluaXRpYWxpemUoKTtcbiAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnem9uaW5nTWFwQXBwJykuY29udHJvbGxlcignYWJvdXRDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sICR3aW5kb3csIG5hdmlnYXRpb25TZXJ2aWNlKSB7XG4gICAgICAgIHZhciBpbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBuYXZpZ2F0aW9uU2VydmljZS51cGRhdGVMb2NhdGlvbignYWJvdXQnKTtcbiAgICAgICAgfTtcbiAgICAgICAgaW5pdGlhbGl6ZSgpO1xuICAgIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ3pvbmluZ01hcEFwcCcpLmNvbnRyb2xsZXIoJ25hdmlnYXRpb25Db250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sICR3aW5kb3csIG5hdmlnYXRpb25TZXJ2aWNlKSB7XG5cbiAgICAgICAgJHNjb3BlLmFjdGl2ZVBhZ2UgPSAnbWFwJztcblxuICAgICAgICAkc2NvcGUuZ290byA9IGZ1bmN0aW9uKGxvYykge1xuICAgICAgICAgICAgJGxvY2F0aW9uLnNlYXJjaCgnJyk7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aChsb2MpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBsb2NhdGlvblVwZGF0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS5hY3RpdmVQYWdlID0gbmF2aWdhdGlvblNlcnZpY2UubG9jYXRpb247XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG5hdmlnYXRpb25TZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIobG9jYXRpb25VcGRhdGVkKTtcbiAgICAgICAgfTtcbiAgICAgICAgaW5pdGlhbGl6ZSgpO1xuXG4gICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnem9uaW5nTWFwQXBwJykuZGlyZWN0aXZlKCd6bU5hdmlnYXRpb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdtb2R1bGVzL25hdmlnYXRpb24vcGFydGlhbHMvbmF2aWdhdGlvblRlbXBsYXRlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ25hdmlnYXRpb25Db250cm9sbGVyJ1xuICAgICAgICB9O1xuICAgIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8qKlxuICAgICAqIFNlZTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjU3Njc5OC9hbmd1bGFyanMtaG93LXRvLXdhdGNoLXNlcnZpY2UtdmFyaWFibGVzLzE3NTU4ODg1IzE3NTU4ODg1XG4gICAgICogRG9pbmcgdGhpbmdzIHRoaXMgd2F5IHNvIHRoYXQgc3NOYXZiYXJDb250cm9sbGVyIGNhbiBnZXQgbm90aWZpZWRcbiAgICAgKiB3aGVuIHRoZSBsb2NhdGlvbiBjaGFuZ2VzLiBUaGVuLCBvdXIgY29udHJvbGxlcnMganVzdCBuZWVkIHRvIGNhbGwgaW50b1xuICAgICAqIHRoaXMgc2VydmljZSB0byB1cGRhdGVMb2NhdGlvbi5cbiAgICAgKlxuICAgICAqIFRoZSBvbmx5IHRoaW5nIEkgZG9uJ3QgbGlrZSBhYm91dCB0aGlzIGlzIHRoYXQgdGhlIGluZGl2aWR1YWxcbiAgICAgKiBjb250cm9sbGVycyBoYXZlIHRvIGNhbGwgaW4gYW5kIHRlbGwgdGhlIHNzTmF2aWdhdGlvblNlcnZpY2Ugd2hhdFxuICAgICAqIHBhZ2UgdGhleSBhcmUgc2hvd2luZy5cbiAgICAgKi9cbiAgICBhbmd1bGFyLm1vZHVsZSgnem9uaW5nTWFwQXBwJykuc2VydmljZSgnbmF2aWdhdGlvblNlcnZpY2UnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdGhpcy5sb2NhdGlvbiA9ICdtYXAnOyAvLyB3aGVyZSB0aGUgYXBwIHN0YXJ0c1xuXG4gICAgICAgIHZhciBvYnNlcnZlcnMgPSBbXTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyT2JzZXJ2ZXIgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgb2JzZXJ2ZXJzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubm90aWZ5T2JzZXJ2ZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gob2JzZXJ2ZXJzLCBmdW5jdGlvbihvYnNlcnZlcikge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnVwZGF0ZUxvY2F0aW9uID0gZnVuY3Rpb24obG9jYXRpb25Jbikge1xuICAgICAgICAgICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uSW47XG4gICAgICAgICAgICB0aGlzLm5vdGlmeU9ic2VydmVycygpO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG59KSgpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
