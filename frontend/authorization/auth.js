var app = angular.module("MeetupApp.Auth", ['ngRoute']); 

app.service("TokenService", function () {
	var userToken = 'token';
	this.saveToken = function (token) {
		localStorage[userToken] = token;
	};
	this.getToken = function (token) {
		return localStorage[userToken];
	};
	this.removeToken = function () {
		localStorage.removeItem(userToken);
	};
});

app.service("UserService", function ($http, $location, TokenService) {

	var baseUrl = "http://localhost:8000";
	var _this = this;

	this.loggedInUser = {};

	this.signup = function (userObj) {
		return $http.post(baseUrl + '/auth/signup', userObj).then(function (response) {
			if (response.data._id && response.data.username === userObj.username) {
				console.log("Successfully signed up!");
				return response.data;
			}
		});
	};
	this.login = function (userObj) {

		var data = {
			username: userObj.email,
			password: userObj.password
		};
		return $http.post(baseUrl + '/auth/login', data).then(function (response) {

			console.log("response ", response);
			if (response.data.token) {
				_this.loggedInUser = response.data.user;
				TokenService.saveToken(response.data.token);
				console.log(_this.loggedInUser);
				$location.path('/home'); //change
			} else {
				alert("Login failed.");
			}
		});
	};
	this.logout = function () {
		TokenService.removeToken();
		this.loggedInUser = {};
	};
});

app.factory("AuthInterceptor", function ($location, $q, TokenService) {
	return {
		request: function (config) {
			var token = TokenService.getToken();
			if (token) {
				config.headers = config.headers || {};
				config.headers.authorization = "Bearer " + token;
			}
			return config;
		},
		responseError: function (response) {
			if (response.status === 401) {
				TokenService.removeToken();
				$location.path("/login");
			}
			$q.reject(response);
		}
	};
});

app.config(["$httpProvider", function ($httpProvider) {
	$httpProvider.interceptors.push("AuthInterceptor");
}]);