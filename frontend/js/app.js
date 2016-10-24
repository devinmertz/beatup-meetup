var app = angular.module("BeatupApp", ["ngRoute"])

.config("$routeProvider", function($routeProvider){
  $routeProvider
  .when("/", {
    templateUrl: "./templates/main.html",
    controller: "LoginController"
  })
  .otherwise("/", {
    templateUrl: "./templates/main.html",
    controller: "LoginController"
  });
})
