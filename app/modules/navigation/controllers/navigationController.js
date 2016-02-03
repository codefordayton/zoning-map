(function () {
    'use strict';

    angular.module('zoningMapApp').controller('navigationController', function($scope, $location, $window, navigationService) {

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

    });
})();
