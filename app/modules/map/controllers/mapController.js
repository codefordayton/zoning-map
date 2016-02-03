(function () {
  'use strict';

  angular.module('zoningMapApp').controller('mapController', function($scope, zmService, L) {
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
  });
})();
