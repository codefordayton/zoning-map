(function () {
    'use strict';

    angular.module('zoningMapApp').controller('aboutController', function($scope, $location, $window, navService) {
        var initialize = function() {
            navService.updateLocation('about');
        };
        initialize();
    });
})();
