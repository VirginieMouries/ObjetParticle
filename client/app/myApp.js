/*
var app = angular.module("myApp", ['ngRoute', 'ngResource']);

app.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: "./static/views/log.html",
                controller: "logCtrl"
                
            })
            .when('/particle', {
                templateUrl: "./static/views/device.html",
                controller: "listeCtrl",
                resolve:{
                    liste: function(listeFactory){
                        return listeFactory.query();
                    }
                }
                
            })
            .otherwise({
                redirectTo: '/',

            });
        
    }
]);
*/

// angularMoment : pour formater la dater . Librairie linkée dans index.html

var app = angular.module("myApp",['ngRoute','ngResource','angularMoment','ui.materialize',"chart.js"]);

app.config(['$routeProvider','$locationProvider',
    function($routeProvider,$locationProvider){
        $routeProvider
        .when('/', {
            templateUrl:'client/views/accueil.html'
        })
        .when('/liste',{
            templateUrl:'client/views/liste.html',
            controller:'liste.ctrl',
            resolve:{
                liste:function(deviceFactory){
                    return deviceFactory.query();
                }
            }
        })
        .when('/device/:id',{ // obtenir le detail de mon device
            templateUrl:'client/views/device.html',
            controller:'device.ctrl'
        })
        .otherwise({
            redirectTo:'/'
        });
}]);

app.filter('dateFr',['moment',function(moment){
    return function(date){
        return moment().format('LLL');
    }
}]);

// pour conserver #! dans les url et ne pas avoir à le remetre dans les routes 
// utilie ?
app.config(['$resourceProvider',function($resourceProvider){
    $resourceProvider.defaults.stripTrailingSlashes = false;
}]);