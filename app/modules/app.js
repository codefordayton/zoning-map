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

    app.config(function($routeProvider, $resourceProvider, pollerConfig) {
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
    })
    .value('moment', window.moment)
    .value('localStorage', window.localStorage);
})();
