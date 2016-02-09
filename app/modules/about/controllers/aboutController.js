(function () {
    'use strict';

    angular.module('zoningMapApp').controller('aboutController', function($scope, $location, $window, navigationService) {
        var initialize = function() {
            navigationService.updateLocation('about');
        };
        initialize();
    });
})();
