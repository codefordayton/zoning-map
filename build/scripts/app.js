!function(){"use strict";var e=angular.module("zoningMapApp",["ngResource","ngSanitize","ngRoute","emguo.poller","ui.bootstrap","ui.grid","ui.grid.selection","ui.grid.pagination","ui.grid.resizeColumns","cfp.hotkeys","nemLogging","ui-leaflet"]);e.config(["$routeProvider","$resourceProvider","pollerConfig",function(e,t,a){a.stopOnRouteChange=!0,a.smart=!0,t.defaults.stripTrailingSlashes=!1,e.when("/",{controller:"mapController",templateUrl:"modules/map/partials/mapTemplate.html"}).when("/about",{controller:"aboutController",templateUrl:"modules/about/partials/aboutTemplate.html"}).otherwise({redirectTo:"/"})}]).value("moment",window.moment).value("localStorage",window.localStorage).value("L",window.L)}(),function(){"use strict";angular.module("zoningMapApp").service("zoningMapConfig",function(){var e={colors:{emo_1:"#556270",emo_2:"#4ecdc4",emo_3:"#c7f464",emo_4:"#ff6b6b",emo_5:"#c44d58",va_1:"#f2385a",va_2:"#f5a503",va_3:"#e9f1df",va_4:"#4ad9d9",va_5:"#3681bf",df_1:"#566669",df_2:"#bfe2ff",df_3:"#0a131a",df_4:"#122031",df_5:"#00010d",chart_blue:"#589ad0",chart_gray:"#cccccc",chart_gray_dark:"#aaaaaa",chart_green:"#8fca0e",chart_orange:"#ff7730",chart_purple:"#bf81bf",chart_red:"#f54d36",chart_white:"#fff",chart_yellow:"#ffc317",chart_pink:"#fb03b2",slate_blue_1:"#171C1C",slate_blue_2:"#0F181C",nav_bg:"slate_blue_1",nav_txt:"light",view_bg:"light",view_txt:"#434649",accent_blue:"va_5",patternDefault:["#4D4D4D","#5DA5DA","#FAA43A","#60BD68","#F17CB0","#B2912F","#B276B2","#DECF3F","#F15854"],healthChart:["#8fca0e","#f54d36","#ffc317","#ff7730","#3681bf","#999999","#d97bf9"],statusChart:["#999999","#d97bf9","#f54d36","#ff7730","#8fca0e","#ffc317","#3681bf"],patternEmo:["#556270","#4ecdc4","#c7f464","#ff6b6b","#c44d58"],patternVa:["#f2385a","#f5a503","#e9f1df","#4ad9d9","#3681bf"],patternDf:["#566669","#bfe2ff","#0a131a","#122031","#00010d"],patternD320:["#1f77bf","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94","#e377c2","#f7b6d2","#7f7f7f","#c7c7c7","#bcbd22","#dbdb8d","#17becf","#9edae5"]}};return e})}(),function(){angular.module("zoningMapApp").service("zmService",function(){return{getViewportSize:function(){var e=window,t=document,a=t.documentElement,n=document.body,o=e.innerWidth||a.clientWidth||n.clientWidth,i=e.innerHeight||a.clientHeight||n.clientHeight;return{width:o,height:i}},formatLatLng:function(e){return e%1===0?e.toFixed(1):e}}})}(),function(){"use strict";angular.module("zoningMapApp").controller("mapController",["$scope","$http","zmService","L","leafletData",function(e,t,a,n,o){e.mapHeight="750px",angular.element(document).ready(function(){var t=a.getViewportSize();e.mapHeight=t.height+"px"});var i=function(){o.getMap().then(function(a){e.map=a,t.get("test/data/daytonMarker.geo.json").success(function(e,t){console.log(e),n.geoJson(e,{}).addTo(a)})}),e.center={lat:39.7594,lng:-84.1917,zoom:12},n.Icon.Default.imagePath="images"};i()}])}(),function(){"use strict";angular.module("zoningMapApp").controller("aboutController",["$scope","$location","$window","navigationService",function(e,t,a,n){var o=function(){n.updateLocation("about")};o()}])}(),function(){"use strict";angular.module("zoningMapApp").controller("navigationController",["$scope","$location","$window","navigationService",function(e,t,a,n){e.activePage="map",e["goto"]=function(e){t.search(""),t.path(e)};var o=function(){e.activePage=n.location},i=function(){n.registerObserver(o)};i()}])}(),function(){"use strict";angular.module("zoningMapApp").directive("zmNavigation",function(){return{restrict:"E",templateUrl:"modules/navigation/partials/navigationTemplate.html",controller:"navigationController"}})}(),function(){"use strict";angular.module("zoningMapApp").service("navigationService",function(){this.location="map";var e=[];this.registerObserver=function(t){e.push(t)},this.notifyObservers=function(){angular.forEach(e,function(e){e()})},this.updateLocation=function(e){this.location=e,this.notifyObservers()}})}();