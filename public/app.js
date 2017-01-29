var dockerWatch = angular.module('DockerWatch', ['ngRoute']);

dockerWatch.config(['$routeProvider',
	function($routeProvider){
		$routeProvider
		.when('/', {
			templateUrl: 'partials/home.html'
		})
		.otherwise({
			redirectTo: "/"
		})
	}
])

dockerWatch.controller('HomeController', ["$scope", "HomeService", "$route", "$timeout", function($scope, HomeService, $route, $timeout){
	var containerId = "098"
	var mostRecentTime = 0
	function getStat(){
		HomeService.getStat(containerId).then(function(res){
			if(Date.parse(res.values[0][0]) > mostRecentTime){
				update(res)
				mostRecentTime = Date.parse(res.values[0][0])
			}
		})		
	}

	function update(res){
		$scope.name = res.name
		var time = res.values[0][0]
		$scope.date = time.substring(0, 10)
		$scope.time = time.substring(11, 25)
		$scope.cpu = res.values[0][1]
		$scope.mem = res.values[0][2]
		console.log('UPDATING STATS', res)
		$timeout(function(){
			getStat()
		}, 1000)
	}
	getStat()
}])

dockerWatch.factory('HomeService', ["$location", "$http", function($location, $http){
	return {
		getStat: function(containerId){
			return $http.get('api/stats/getStat/' + containerId)
			.then(function(response){
				var stats = Promise.resolve(response).then(function(v){
					return v.data
				})
				return stats
			})
		}
	}
}])