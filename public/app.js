var dockerWatch = angular.module('DockerWatch', ['ngRoute']);

dockerWatch.config(['$routeProvider',
	function($routeProvider){
		$routeProvider
		.when('/', {
			templateUrl: 'partials/home.html'
		})
		.when('/projects', {
			templateUrl: 'partials/projects.html'
		})
		.when('/new-project', {
			templateUrl: 'partials/newProject.html'
		})
		.otherwise({
			redirectTo: "/"
		})
	}
])

//Home
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

//Projects
dockerWatch.controller('ProjectsController', ["$scope", "ProjectsService", "$timeout", "$location", function($scope, ProjectsService, $timeout, $location){
	$scope.projects = []
	function getProjects(){
		ProjectsService.getProjects().then(function(res){
			var projects = []
			for (projectIndex in res.values){
				var containers = res.values[projectIndex][1].split(';')
				var project = {
					id: res.values[projectIndex][5],
					name: res.values[projectIndex][3],
					owner: res.values[projectIndex][4],
					containers: containers
				}
				projects.push(project)
			}
			$timeout(function(){ //Temporary fix to a unusual problem (Journal 29/01/17)
				$scope.projects = projects
				console.log('UPDATING PROJECTS:', projects)
			}, 0)
		})		
	}
	getProjects()
	$scope.newProject = function(){
		$location.path('/new-project')
	}
}])

dockerWatch.factory('ProjectsService', ["$http", function($http){
	return {
		getProjects: function(){
			return $http.get('api/projects/getProjects/')
			.then(function(response){
				var projects = Promise.resolve(response).then(function(v){
					return v.data
				})
				return projects
			})
		}
	}
}])


//New Projects
dockerWatch.controller('NewProjectsController', ["$scope", "NewProjectsService", "$location", function($scope, NewProjectsService, $location){
	$scope.addNewProject = function(){
		var project = {
			name: $scope.name,
			conIds: $scope.conIds
		}
		createProject(project)
		$scope.name = ""
		$scope.conIds = ""
		$location.path('/projects')
	}
}])

dockerWatch.factory('NewProjectsService', ["$http", function($http){
	createProject = function(project){
		$http.post('api/projects/newProject/', project).then(function(res){
			console.log('RETURNED:', res)
		})
	}
	// return {

	// }
}])