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
    .value('localStorage', window.localStorage);
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
    'use strict';

    angular.module('zoningMapApp').controller('aboutController', ['$scope', '$location', '$window', 'navService', function($scope, $location, $window, navService) {
        var initialize = function() {
            navService.updateLocation('about');
        };
        initialize();
    }]);
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

    angular.module('zoningMapApp').controller('navigationController', ['$scope', '$location', '$window', 'navigationService', function($scope, $location, $window, navigationService) {

        $scope.activePage = 'map';

        $scope.goto = function(loc) {
            $location.search('');
            $location.path(loc);
        };

        var locationUpdated = function() {
            $scope.activePage = navService.location;
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

(function () {
  'use strict';

  angular.module('zoningMapApp').controller('mapController', ['$scope', 'zmService', 'L', function($scope, zmService, L) {
    $scope.mapHeight='750px';
    
    angular.element(document).ready(function () {
      // set map height equal to available page height
      var viewport = zmService.getViewportSize();
      $scope.mapHeight = viewport.height + 'px';
    });

    var initialize = function() {
      $scope.center = {
            lat: 39.7594,
            lng: -84.1917,
            zoom: 12
      };
    };
    initialize();
  }]);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsInpvbmluZ01hcENvbmZpZy5qcyIsImFib3V0L2NvbnRyb2xsZXJzL2Fib3V0Q29udHJvbGxlci5qcyIsImNvbW1vbi9zZXJ2aWNlcy96bVNlcnZpY2UuanMiLCJuYXZpZ2F0aW9uL2NvbnRyb2xsZXJzL25hdmlnYXRpb25Db250cm9sbGVyLmpzIiwibmF2aWdhdGlvbi9kaXJlY3RpdmVzL25hdmlnYXRpb25EaXJlY3RpdmUuanMiLCJuYXZpZ2F0aW9uL3NlcnZpY2VzL25hdmlnYXRpb25TZXJ2aWNlLmpzIiwibWFwL2NvbnRyb2xsZXJzL21hcENvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBQSxZQUFBO0lBQ0E7O0lBRUEsSUFBQSxNQUFBLFFBQUEsT0FBQSxnQkFBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7O0lBR0EsSUFBQSwrREFBQSxTQUFBLGdCQUFBLG1CQUFBLGNBQUE7O1FBRUEsYUFBQSxvQkFBQTtRQUNBLGFBQUEsUUFBQTs7O1FBR0Esa0JBQUEsU0FBQSx1QkFBQTs7O1FBR0E7YUFDQSxLQUFBLEtBQUE7Z0JBQ0EsWUFBQTtnQkFDQSxhQUFBOzthQUVBLEtBQUEsVUFBQTtjQUNBLFlBQUE7Y0FDQSxhQUFBOzthQUVBLFVBQUE7Z0JBQ0EsWUFBQTs7O0tBR0EsTUFBQSxVQUFBLE9BQUE7S0FDQSxNQUFBLGdCQUFBLE9BQUE7OztBQ3pDQSxDQUFBLFlBQUE7SUFDQTs7SUFFQSxRQUFBLE9BQUEsZ0JBQUEsUUFBQSxtQkFBQSxZQUFBOztRQUVBLElBQUEsTUFBQTtVQUNBLFFBQUE7WUFDQSxPQUFBO1lBQ0EsT0FBQTtZQUNBLE9BQUE7WUFDQSxPQUFBO1lBQ0EsT0FBQTs7WUFFQSxNQUFBO1lBQ0EsTUFBQTtZQUNBLE1BQUE7WUFDQSxNQUFBO1lBQ0EsTUFBQTs7WUFFQSxNQUFBO1lBQ0EsTUFBQTtZQUNBLE1BQUE7WUFDQSxNQUFBO1lBQ0EsTUFBQTs7WUFFQSxZQUFBO1lBQ0EsWUFBQTtZQUNBLGlCQUFBO1lBQ0EsYUFBQTtZQUNBLGNBQUE7WUFDQSxjQUFBO1lBQ0EsV0FBQTtZQUNBLGFBQUE7WUFDQSxjQUFBO1lBQ0EsWUFBQTs7WUFFQSxjQUFBO1lBQ0EsY0FBQTs7WUFFQSxRQUFBO1lBQ0EsU0FBQTs7WUFFQSxTQUFBO1lBQ0EsVUFBQTs7WUFFQSxhQUFBOztZQUVBLGdCQUFBLENBQUEsV0FBQSxXQUFBLFdBQUEsV0FBQSxXQUFBLFdBQUEsV0FBQSxXQUFBO1lBQ0EsYUFBQSxDQUFBLFdBQUEsV0FBQSxXQUFBLFdBQUEsV0FBQSxXQUFBO1lBQ0EsYUFBQSxDQUFBLFdBQUEsV0FBQSxXQUFBLFdBQUEsV0FBQSxXQUFBO1lBQ0EsWUFBQSxDQUFBLFdBQUEsV0FBQSxXQUFBLFdBQUE7WUFDQSxXQUFBLENBQUEsV0FBQSxXQUFBLFdBQUEsV0FBQTtZQUNBLFdBQUEsQ0FBQSxXQUFBLFdBQUEsV0FBQSxXQUFBO1lBQ0EsYUFBQSxDQUFBLFdBQUEsV0FBQSxXQUFBLFdBQUEsV0FBQSxXQUFBLFdBQUEsV0FBQSxXQUFBLFdBQUEsV0FBQSxXQUFBLFdBQUEsV0FBQSxXQUFBLFdBQUEsV0FBQSxXQUFBLFdBQUE7Ozs7UUFJQSxPQUFBOzs7O0FDekRBLENBQUEsWUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxnQkFBQSxXQUFBLG9FQUFBLFNBQUEsUUFBQSxXQUFBLFNBQUEsWUFBQTtRQUNBLElBQUEsYUFBQSxXQUFBO1lBQ0EsV0FBQSxlQUFBOztRQUVBOzs7O0FDUEEsQ0FBQSxZQUFBO0lBQ0EsUUFBQSxPQUFBLGdCQUFBLFFBQUEsYUFBQSxZQUFBOztRQUVBLE9BQUE7WUFDQSxpQkFBQSxZQUFBO2dCQUNBLElBQUEsSUFBQTtvQkFDQSxJQUFBO29CQUNBLElBQUEsRUFBQTtvQkFDQSxJQUFBLFNBQUE7b0JBQ0EsSUFBQSxFQUFBLGNBQUEsRUFBQSxlQUFBLEVBQUE7b0JBQ0EsSUFBQSxFQUFBLGVBQUEsRUFBQSxnQkFBQSxFQUFBOztnQkFFQSxPQUFBO29CQUNBLE9BQUE7b0JBQ0EsUUFBQTs7O1lBR0EsY0FBQSxVQUFBLE9BQUE7O2dCQUVBLE9BQUEsQ0FBQSxRQUFBLE1BQUEsS0FBQSxNQUFBLFFBQUEsS0FBQTs7Ozs7O0FDbkJBLENBQUEsWUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxnQkFBQSxXQUFBLGdGQUFBLFNBQUEsUUFBQSxXQUFBLFNBQUEsbUJBQUE7O1FBRUEsT0FBQSxhQUFBOztRQUVBLE9BQUEsT0FBQSxTQUFBLEtBQUE7WUFDQSxVQUFBLE9BQUE7WUFDQSxVQUFBLEtBQUE7OztRQUdBLElBQUEsa0JBQUEsV0FBQTtZQUNBLE9BQUEsYUFBQSxXQUFBOzs7UUFHQSxJQUFBLGFBQUEsV0FBQTtZQUNBLGtCQUFBLGlCQUFBOztRQUVBOzs7OztBQ25CQSxDQUFBLFlBQUE7SUFDQTs7SUFFQSxRQUFBLE9BQUEsZ0JBQUEsVUFBQSxnQkFBQSxZQUFBO1FBQ0EsT0FBQTtZQUNBLFVBQUE7WUFDQSxhQUFBO1lBQ0EsWUFBQTs7Ozs7QUNQQSxDQUFBLFlBQUE7SUFDQTs7Ozs7Ozs7Ozs7SUFXQSxRQUFBLE9BQUEsZ0JBQUEsUUFBQSxxQkFBQSxZQUFBOztRQUVBLEtBQUEsV0FBQTs7UUFFQSxJQUFBLFlBQUE7O1FBRUEsS0FBQSxtQkFBQSxTQUFBLFVBQUE7WUFDQSxVQUFBLEtBQUE7OztRQUdBLEtBQUEsa0JBQUEsV0FBQTtZQUNBLFFBQUEsUUFBQSxXQUFBLFNBQUEsVUFBQTtnQkFDQTs7OztRQUlBLEtBQUEsaUJBQUEsU0FBQSxZQUFBO1lBQ0EsS0FBQSxXQUFBO1lBQ0EsS0FBQTs7Ozs7O0FDOUJBLENBQUEsWUFBQTtFQUNBOztFQUVBLFFBQUEsT0FBQSxnQkFBQSxXQUFBLDhDQUFBLFNBQUEsUUFBQSxXQUFBLEdBQUE7SUFDQSxPQUFBLFVBQUE7O0lBRUEsUUFBQSxRQUFBLFVBQUEsTUFBQSxZQUFBOztNQUVBLElBQUEsV0FBQSxVQUFBO01BQ0EsT0FBQSxZQUFBLFNBQUEsU0FBQTs7O0lBR0EsSUFBQSxhQUFBLFdBQUE7TUFDQSxPQUFBLFNBQUE7WUFDQSxLQUFBO1lBQ0EsS0FBQSxDQUFBO1lBQ0EsTUFBQTs7O0lBR0E7OztBQUdBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCd6b25pbmdNYXBBcHAnLCBbXG4gICAgICAgICduZ1Jlc291cmNlJyxcbiAgICAgICAgJ25nU2FuaXRpemUnLFxuICAgICAgICAnbmdSb3V0ZScsXG4gICAgICAgICdlbWd1by5wb2xsZXInLFxuICAgICAgICAndWkuYm9vdHN0cmFwJyxcbiAgICAgICAgJ3VpLmdyaWQnLFxuICAgICAgICAndWkuZ3JpZC5zZWxlY3Rpb24nLFxuICAgICAgICAndWkuZ3JpZC5wYWdpbmF0aW9uJyxcbiAgICAgICAgJ3VpLmdyaWQucmVzaXplQ29sdW1ucycsXG4gICAgICAgICdjZnAuaG90a2V5cycsXG4gICAgICAgICduZW1Mb2dnaW5nJyxcbiAgICAgICAgJ3VpLWxlYWZsZXQnXG4gICAgXSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkcmVzb3VyY2VQcm92aWRlciwgcG9sbGVyQ29uZmlnKSB7XG4gICAgICAgIC8vIHN0b3AgcG9sbGVycyB3aGVuIHJvdXRlIGNoYW5nZXNcbiAgICAgICAgcG9sbGVyQ29uZmlnLnN0b3BPblJvdXRlQ2hhbmdlID0gdHJ1ZTtcbiAgICAgICAgcG9sbGVyQ29uZmlnLnNtYXJ0ID0gdHJ1ZTtcblxuICAgICAgICAvLyBwcmVzZXJ2ZSB0cmFpbGluZyBzbGFzaGVzXG4gICAgICAgICRyZXNvdXJjZVByb3ZpZGVyLmRlZmF1bHRzLnN0cmlwVHJhaWxpbmdTbGFzaGVzID0gZmFsc2U7XG5cbiAgICAgICAgLy9yb3V0aW5nXG4gICAgICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAgICAgICAud2hlbignLycsIHtcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnbWFwQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdtb2R1bGVzL21hcC9wYXJ0aWFscy9tYXBUZW1wbGF0ZS5odG1sJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC53aGVuKCcvYWJvdXQnLCB7XG4gICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdhYm91dENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ21vZHVsZXMvYWJvdXQvcGFydGlhbHMvYWJvdXRUZW1wbGF0ZS5odG1sJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vdGhlcndpc2Uoe1xuICAgICAgICAgICAgICAgIHJlZGlyZWN0VG86ICcvJ1xuICAgICAgICAgICAgfSk7XG4gICAgfSlcbiAgICAudmFsdWUoJ21vbWVudCcsIHdpbmRvdy5tb21lbnQpXG4gICAgLnZhbHVlKCdsb2NhbFN0b3JhZ2UnLCB3aW5kb3cubG9jYWxTdG9yYWdlKTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXIubW9kdWxlKCd6b25pbmdNYXBBcHAnKS5zZXJ2aWNlKCd6b25pbmdNYXBDb25maWcnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGNmZyA9IHtcbiAgICAgICAgICBjb2xvcnM6IHtcbiAgICAgICAgICAgIGVtb18xOiAnIzU1NjI3MCcsXG4gICAgICAgICAgICBlbW9fMjogJyM0ZWNkYzQnLFxuICAgICAgICAgICAgZW1vXzM6ICcjYzdmNDY0JyxcbiAgICAgICAgICAgIGVtb180OiAnI2ZmNmI2YicsXG4gICAgICAgICAgICBlbW9fNTogJyNjNDRkNTgnLFxuXG4gICAgICAgICAgICB2YV8xOiAnI2YyMzg1YScsXG4gICAgICAgICAgICB2YV8yOiAnI2Y1YTUwMycsXG4gICAgICAgICAgICB2YV8zOiAnI2U5ZjFkZicsXG4gICAgICAgICAgICB2YV80OiAnIzRhZDlkOScsXG4gICAgICAgICAgICB2YV81OiAnIzM2ODFiZicsXG5cbiAgICAgICAgICAgIGRmXzE6ICcjNTY2NjY5JyxcbiAgICAgICAgICAgIGRmXzI6ICcjYmZlMmZmJyxcbiAgICAgICAgICAgIGRmXzM6ICcjMGExMzFhJyxcbiAgICAgICAgICAgIGRmXzQ6ICcjMTIyMDMxJyxcbiAgICAgICAgICAgIGRmXzU6ICcjMDAwMTBkJyxcblxuICAgICAgICAgICAgY2hhcnRfYmx1ZTogJyM1ODlhZDAnLFxuICAgICAgICAgICAgY2hhcnRfZ3JheTogJyNjY2NjY2MnLFxuICAgICAgICAgICAgY2hhcnRfZ3JheV9kYXJrOiAnI2FhYWFhYScsXG4gICAgICAgICAgICBjaGFydF9ncmVlbjogJyM4ZmNhMGUnLFxuICAgICAgICAgICAgY2hhcnRfb3JhbmdlOiAnI2ZmNzczMCcsXG4gICAgICAgICAgICBjaGFydF9wdXJwbGU6ICcjYmY4MWJmJyxcbiAgICAgICAgICAgIGNoYXJ0X3JlZDogJyNmNTRkMzYnLFxuICAgICAgICAgICAgY2hhcnRfd2hpdGU6ICcjZmZmJyxcbiAgICAgICAgICAgIGNoYXJ0X3llbGxvdzogJyNmZmMzMTcnLFxuICAgICAgICAgICAgY2hhcnRfcGluazogJyNmYjAzYjInLFxuXG4gICAgICAgICAgICBzbGF0ZV9ibHVlXzE6ICcjMTcxQzFDJyxcbiAgICAgICAgICAgIHNsYXRlX2JsdWVfMjogJyMwRjE4MUMnLFxuXG4gICAgICAgICAgICBuYXZfYmc6ICdzbGF0ZV9ibHVlXzEnLFxuICAgICAgICAgICAgbmF2X3R4dDogJ2xpZ2h0JyxcblxuICAgICAgICAgICAgdmlld19iZzogJ2xpZ2h0JyxcbiAgICAgICAgICAgIHZpZXdfdHh0OiAnIzQzNDY0OScsXG5cbiAgICAgICAgICAgIGFjY2VudF9ibHVlOiAndmFfNScsXG5cbiAgICAgICAgICAgIHBhdHRlcm5EZWZhdWx0OiBbJyM0RDRENEQnLCAnIzVEQTVEQScsICcjRkFBNDNBJywgJyM2MEJENjgnLCAnI0YxN0NCMCcsICcjQjI5MTJGJywgJyNCMjc2QjInLCAnI0RFQ0YzRicsICcjRjE1ODU0J10sXG4gICAgICAgICAgICBoZWFsdGhDaGFydDogWycjOGZjYTBlJywgJyNmNTRkMzYnLCAnI2ZmYzMxNycsICcjZmY3NzMwJywgJyMzNjgxYmYnLCAnIzk5OTk5OScsICcjZDk3YmY5J10sXG4gICAgICAgICAgICBzdGF0dXNDaGFydDogWycjOTk5OTk5JywgJyNkOTdiZjknLCAnI2Y1NGQzNicsICcjZmY3NzMwJywgJyM4ZmNhMGUnLCAnI2ZmYzMxNycsICcjMzY4MWJmJ10sXG4gICAgICAgICAgICBwYXR0ZXJuRW1vOiBbJyM1NTYyNzAnLCAnIzRlY2RjNCcsICcjYzdmNDY0JywgJyNmZjZiNmInLCAnI2M0NGQ1OCddLFxuICAgICAgICAgICAgcGF0dGVyblZhOiBbJyNmMjM4NWEnLCAnI2Y1YTUwMycsICcjZTlmMWRmJywgJyM0YWQ5ZDknLCAnIzM2ODFiZiddLFxuICAgICAgICAgICAgcGF0dGVybkRmOiBbJyM1NjY2NjknLCAnI2JmZTJmZicsICcjMGExMzFhJywgJyMxMjIwMzEnLCAnIzAwMDEwZCddLFxuICAgICAgICAgICAgcGF0dGVybkQzMjA6IFsnIzFmNzdiZicsICcjYWVjN2U4JywgJyNmZjdmMGUnLCAnI2ZmYmI3OCcsICcjMmNhMDJjJywgJyM5OGRmOGEnLCAnI2Q2MjcyOCcsICcjZmY5ODk2JywgJyM5NDY3YmQnLCAnI2M1YjBkNScsICcjOGM1NjRiJywgJyNjNDljOTQnLCAnI2UzNzdjMicsICcjZjdiNmQyJywgJyM3ZjdmN2YnLCAnI2M3YzdjNycsICcjYmNiZDIyJywgJyNkYmRiOGQnLCAnIzE3YmVjZicsICcjOWVkYWU1J11cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2ZnO1xuICAgIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ3pvbmluZ01hcEFwcCcpLmNvbnRyb2xsZXIoJ2Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCAkd2luZG93LCBuYXZTZXJ2aWNlKSB7XG4gICAgICAgIHZhciBpbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBuYXZTZXJ2aWNlLnVwZGF0ZUxvY2F0aW9uKCdhYm91dCcpO1xuICAgICAgICB9O1xuICAgICAgICBpbml0aWFsaXplKCk7XG4gICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnem9uaW5nTWFwQXBwJykuc2VydmljZSgnem1TZXJ2aWNlJywgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBnZXRWaWV3cG9ydFNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdyA9IHdpbmRvdyxcbiAgICAgICAgICAgICAgICAgICAgZCA9IGRvY3VtZW50LFxuICAgICAgICAgICAgICAgICAgICBlID0gZC5kb2N1bWVudEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgIGcgPSBkb2N1bWVudC5ib2R5LFxuICAgICAgICAgICAgICAgICAgICB4ID0gdy5pbm5lcldpZHRoIHx8IGUuY2xpZW50V2lkdGggfHwgZy5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgeSA9IHcuaW5uZXJIZWlnaHQgfHwgZS5jbGllbnRIZWlnaHQgfHwgZy5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogeCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB5XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmb3JtYXRMYXRMbmc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSBib3VuZHMgdmFsdWVzIGhhdmUgYXQgbGVhc3QgMSBkZWNpbWFsIHBsYWNlXG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSAlIDEgPT09IDApID8gdmFsdWUudG9GaXhlZCgxKSA6IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ3pvbmluZ01hcEFwcCcpLmNvbnRyb2xsZXIoJ25hdmlnYXRpb25Db250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sICR3aW5kb3csIG5hdmlnYXRpb25TZXJ2aWNlKSB7XG5cbiAgICAgICAgJHNjb3BlLmFjdGl2ZVBhZ2UgPSAnbWFwJztcblxuICAgICAgICAkc2NvcGUuZ290byA9IGZ1bmN0aW9uKGxvYykge1xuICAgICAgICAgICAgJGxvY2F0aW9uLnNlYXJjaCgnJyk7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aChsb2MpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBsb2NhdGlvblVwZGF0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS5hY3RpdmVQYWdlID0gbmF2U2VydmljZS5sb2NhdGlvbjtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbmF2aWdhdGlvblNlcnZpY2UucmVnaXN0ZXJPYnNlcnZlcihsb2NhdGlvblVwZGF0ZWQpO1xuICAgICAgICB9O1xuICAgICAgICBpbml0aWFsaXplKCk7XG5cbiAgICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXIubW9kdWxlKCd6b25pbmdNYXBBcHAnKS5kaXJlY3RpdmUoJ3ptTmF2aWdhdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ21vZHVsZXMvbmF2aWdhdGlvbi9wYXJ0aWFscy9uYXZpZ2F0aW9uVGVtcGxhdGUuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnbmF2aWdhdGlvbkNvbnRyb2xsZXInXG4gICAgICAgIH07XG4gICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgLyoqXG4gICAgICogU2VlOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyNTc2Nzk4L2FuZ3VsYXJqcy1ob3ctdG8td2F0Y2gtc2VydmljZS12YXJpYWJsZXMvMTc1NTg4ODUjMTc1NTg4ODVcbiAgICAgKiBEb2luZyB0aGluZ3MgdGhpcyB3YXkgc28gdGhhdCBzc05hdmJhckNvbnRyb2xsZXIgY2FuIGdldCBub3RpZmllZFxuICAgICAqIHdoZW4gdGhlIGxvY2F0aW9uIGNoYW5nZXMuIFRoZW4sIG91ciBjb250cm9sbGVycyBqdXN0IG5lZWQgdG8gY2FsbCBpbnRvXG4gICAgICogdGhpcyBzZXJ2aWNlIHRvIHVwZGF0ZUxvY2F0aW9uLlxuICAgICAqXG4gICAgICogVGhlIG9ubHkgdGhpbmcgSSBkb24ndCBsaWtlIGFib3V0IHRoaXMgaXMgdGhhdCB0aGUgaW5kaXZpZHVhbFxuICAgICAqIGNvbnRyb2xsZXJzIGhhdmUgdG8gY2FsbCBpbiBhbmQgdGVsbCB0aGUgc3NOYXZpZ2F0aW9uU2VydmljZSB3aGF0XG4gICAgICogcGFnZSB0aGV5IGFyZSBzaG93aW5nLlxuICAgICAqL1xuICAgIGFuZ3VsYXIubW9kdWxlKCd6b25pbmdNYXBBcHAnKS5zZXJ2aWNlKCduYXZpZ2F0aW9uU2VydmljZScsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB0aGlzLmxvY2F0aW9uID0gJ21hcCc7IC8vIHdoZXJlIHRoZSBhcHAgc3RhcnRzXG5cbiAgICAgICAgdmFyIG9ic2VydmVycyA9IFtdO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJPYnNlcnZlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBvYnNlcnZlcnMucHVzaChjYWxsYmFjayk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5ub3RpZnlPYnNlcnZlcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChvYnNlcnZlcnMsIGZ1bmN0aW9uKG9ic2VydmVyKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudXBkYXRlTG9jYXRpb24gPSBmdW5jdGlvbihsb2NhdGlvbkluKSB7XG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uID0gbG9jYXRpb25JbjtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5T2JzZXJ2ZXJzKCk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhci5tb2R1bGUoJ3pvbmluZ01hcEFwcCcpLmNvbnRyb2xsZXIoJ21hcENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIHptU2VydmljZSwgTCkge1xuICAgICRzY29wZS5tYXBIZWlnaHQ9Jzc1MHB4JztcbiAgICBcbiAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIHNldCBtYXAgaGVpZ2h0IGVxdWFsIHRvIGF2YWlsYWJsZSBwYWdlIGhlaWdodFxuICAgICAgdmFyIHZpZXdwb3J0ID0gem1TZXJ2aWNlLmdldFZpZXdwb3J0U2l6ZSgpO1xuICAgICAgJHNjb3BlLm1hcEhlaWdodCA9IHZpZXdwb3J0LmhlaWdodCArICdweCc7XG4gICAgfSk7XG5cbiAgICB2YXIgaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmNlbnRlciA9IHtcbiAgICAgICAgICAgIGxhdDogMzkuNzU5NCxcbiAgICAgICAgICAgIGxuZzogLTg0LjE5MTcsXG4gICAgICAgICAgICB6b29tOiAxMlxuICAgICAgfTtcbiAgICB9O1xuICAgIGluaXRpYWxpemUoKTtcbiAgfSk7XG59KSgpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
