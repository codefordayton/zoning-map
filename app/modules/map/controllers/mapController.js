(function () {
  'use strict';

  angular.module('zoningMapApp').controller('mapController', function($scope, $http, zmService, L, leafletData) {
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
  });
})();
