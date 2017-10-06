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