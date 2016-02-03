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
