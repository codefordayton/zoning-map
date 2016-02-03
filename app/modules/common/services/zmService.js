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
