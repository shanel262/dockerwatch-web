var dockerWatch = angular.module('DockerWatch', ['ngRoute', 'nvd3']);

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
		.when('/project/:projectID', {
			templateUrl: 'partials/projectView.html'
		})
		.when('/edit-project/:projectID', {
			templateUrl: 'partials/editProject.html'
		})
		.when('/container/:containerID', {
			templateUrl: 'partials/container.html'
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
		$scope.data = [
			{
				key: "Used",
				y: res.values[0][1]
			},
			{
				key: "Free",
				y: 100 - res.values[0][1]
			}
		]
		$scope.$apply()
		console.log('UPDATING STATS', res)
		$timeout(function(){
			getStat()
		}, 1000)
	}
	getStat()

	$scope.options = {
		chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }
	};
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
			for (projectIndex in res.data){
				try{
					var containers = res.data[projectIndex].containers.split(';')
					if(containers.length == 1 && containers[0] == ""){
						containers = []
					}
				}
				catch(err){
					console.log('CANNOT READ CONTAINERS:', err)
					var containers = []
				}
				var project = {
					id: res.data[projectIndex]._id,
					name: res.data[projectIndex].name,
					owner: res.data[projectIndex].owner,
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
				console.log('RESPONSE:', response)
				return response
			})
		}
	}
}])


//New Projects
dockerWatch.controller('NewProjectsController', ["$scope", "NewProjectsService", "$location", function($scope, NewProjectsService, $location){
	$scope.addNewProject = function(){
		if($scope.conIds == ""){
			$scope.conIds = undefined //If user types in conIds form but leaves it empty, it created an empty string
		}
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

//Single project
dockerWatch.controller('SingleProjectController', ["$scope", "SingleProjectService", "$routeParams", "$http", "$timeout", "$location", "$window", "$route", function($scope, SingleProjectService, $routeParams, $http, $timeout, $location, $window, $route){
	$http.get('/api/projects/' + $routeParams.projectID).success(function(project){
		console.log('RESPONSE1:', project)
		var utcTime = dateFromObjectID(project._id)
		$scope.utcTime = utcTime
		$scope.date = utcTime.substring(0, 10)
		$scope.time = utcTime.substring(11, 19)
		$scope.name = project.name
		$scope.owner = project.owner
		$scope.id = project._id
		try{
			$scope.containers = project.containers.split(';')
			if($scope.containers.length == 1 && $scope.containers[0] == ""){
				$scope.containers = []
			}
		}
		catch(err){
			console.log('CANNOT READ CONTAINERS:', err)
			$scope.containers = []
		}
		$scope.projectContainerConcat = []
		for (var i = 0; i <= $scope.containers.length - 1; i++) {
			$scope.projectContainerConcat.push(project._id + '.' + $scope.containers[i])
		}
		$scope.containerString = project.containers
	})
	.error(function(data, status, headers, config){
		console.log('ERROR:', status, ':' ,data)
		$location.path('/projects')
	})

	$scope.saveProject = function(){
		var newInfo = {
			id: $scope.id,
			name: $scope.name,
			owner: $scope.owner,
			conIds: $scope.containerString,
			time: $scope.utcTime
		}
		save(newInfo)
		$location.path('/project/' + $scope.id)
	}

	$scope.deleteProject = function(){
		var info = {
			id: $scope.id
		}
		var deleteProject = $window.confirm('Delete project: Are you sure?')
		if(deleteProject){
			console.log('Delete project')
			deletePro(info)
			$location.path('/projects')
		}
		else{
			console.log("Don't delete project")
		}
	}

	$scope.addContainer = function(){
		console.log('Adding container:', $scope.conId)
		$scope.status = "Loading..."
		SingleProjectService.checkContainer($scope.conId).then(function(res){
			console.log('IMBACK:', res)
			analyse(res)
		})
	}

	function analyse(res){
		if(res.data.length == 0){
			console.log('It does not exist in influx')
			$scope.status = 'failure'
		}
		else if(res.data.length == 1){
			console.log('It does exist in influx')
			$scope.status = 'success'
			var newConString
			if($scope.containerString == undefined || $scope.containerString == ""){
				newConString = $scope.conId
			}
			else{
				newConString = $scope.containerString + ';' + $scope.conId
			}
			var newInfo = {
				id: $scope.id,
				name: $scope.name,
				owner: $scope.owner,
				conIds: newConString,
				time: $scope.utcTime
			}
			save(newInfo)
			$timeout(function(){
				$route.reload()
			}, 4000)
		}
		else{
			console.log('Unexpected response')
			$scope.status = "Error"
		}
		$scope.conId = ''
		$timeout(function(){
		}, 0)
	}


	function dateFromObjectID(objectId){
		return new Date(parseInt(objectId.substring(0, 8), 16) * 1000).toISOString()
	}
}])

dockerWatch.factory('SingleProjectService', ["$http", function($http){
	save = function(newInfo){
		$http.post('/api/projects/editProject', newInfo).then(function(res){
			console.log('RESPONSE:', res)
		})
	}

	deletePro = function(info){
		console.log('PROJECTID:', info.id)
		$http.delete('/api/projects/deleteProject/' + info.id).then(function(res){
			console.log('RESPONSE:', res)
		})
	}
	return {
		checkContainer: function(containerId){
			return $http.get('api/stats/checkContainer/' + containerId)
			.then(function(response){
				var res = Promise.resolve(response).then(function(v){
					console.log('V:', v)
					return v
				})
				return res
			})
		}
	}
}])

//Single Container View
dockerWatch.controller('SingleContainerController', ["$scope", "SingleContainerService", "$route", "$timeout", "$routeParams", "$http", "$window", "$location", function($scope, SingleContainerService, $route, $timeout, $routeParams, $http, $window, $location){
	var split = $routeParams.containerID.split('.')
	var projectId = split[0]
	var containerId = split[1]
	var mostRecentTime = 0
	function getStat(){
		SingleContainerService.getStat(containerId).then(function(res){
			if(Date.parse(res.values[0][0]) > mostRecentTime){
				updateStats(res)
				mostRecentTime = Date.parse(res.values[0][0])
			}
		})		
	}
	function getInfo(){
		SingleContainerService.getInfo(containerId).then(function(res){
			updateInfo(res)
		})
	}

	function updateStats(res){
		console.log('updateStatsRes:', res)
		$scope.conID = res.name
		$scope.dateTime = parseTime(res.values[0][0], 25)
		var cpuInfo = parseInfluxData(res, res.columns.indexOf('cpu'))
		$scope.cpuData = [
			{
				values: cpuInfo,      //values - represents the array of {x,y} data points
				key: 'CPU usage', //key  - the name of the series.
				color: '#2ca02c',  //color - optional: choose your own line color.
				// area: false,
				classed: 'dashed'
			}
		]
		var memInfo = parseInfluxData(res, res.columns.indexOf('memPerc'))
		$scope.memData = [
			{
				values: memInfo,      //values - represents the array of {x,y} data points
				key: 'Memory usage', //key  - the name of the series.
				color: '#7777ff',  //color - optional: choose your own line color.
				// area: false,
				classed: 'dashed'
			}
		]
		$scope.memBytes = parseMem(res.values[0][res.columns.indexOf('memBytes')])
		$scope.memPerc = res.values[0][res.columns.indexOf('memPerc')]
		var rxBytes = parseInfluxData(res, res.columns.indexOf('rxBytes'))
		var txBytes = parseInfluxData(res, res.columns.indexOf('txBytes'))
		$scope.bytesData = [
			{
				values: rxBytes,
				key: 'Bytes received'
			},
			{
				values: txBytes,
				key: 'Bytes sent'
			}
		]
		$scope.$apply()
		$timeout(function(){
			getStat()
		}, 2000)
	}
	function updateInfo(res){
		console.log('updateInfoRes:', res)
		var columns = res.columns //Influx returns positions of values array so use it
		$scope.conName = res.values[0][columns.indexOf('name')]
		$scope.created = parseTime(res.values[0][columns.indexOf('created')], 19)
		$scope.image = res.values[0][columns.indexOf('image')]
		$scope.ipAddress = res.values[0][columns.indexOf('ipAddress')]
		$scope.macAddress = res.values[0][columns.indexOf('macAddress')]
		$scope.port = res.values[0][columns.indexOf('port')]
		$scope.restartCount = res.values[0][columns.indexOf('restartCount')]
		$scope.state = JSON.parse(res.values[0][columns.indexOf('state')]).Status
		$scope.startedAt = parseTime(JSON.parse(res.values[0][columns.indexOf('state')]).StartedAt, 19)
		$scope.subnetAddress = res.values[0][columns.indexOf('subnetAddress')]
		$scope.lastUpdateFromCon = parseTime(res.values[0][columns.indexOf('time')], 19)
		$scope.memLimit = (res.values[0][columns.indexOf('memLimit')] !== 0) ? parseMem(res.values[0][columns.indexOf('memLimit')]) : 'NA'
		var currentTime = new Date()
		$scope.lastUpdatedAt = currentTime.toUTCString()
		$scope.$apply()
		$timeout(function(){
			getInfo()
		}, 300000) //Wait 5 minutes
	}
	getStat()
	getInfo()

	function parseMem(mem){
		var memVal = '0'
		if(mem.toString().length < 7){
			memVal = (mem / 1024).toFixed(2) + 'KB'
		}
		else if(mem.toString().length < 10){
			memVal = (mem / 1048576).toFixed(2) + 'MB'
		}
		else if(mem.toString().length < 13){
			memVal = (mem / 1073741824).toFixed(2) + 'GB'
		}
		return memVal
	}

	function parseTime(time, cutoff){
		var date = time.substring(0, 10)
		var time = time.substring(11, cutoff)
		var conCat = date + ' - ' + time
		return conCat
	}

	function parseInfluxData(data, dataPos){
		var jsonArray = []
		var values = data.values
		var columns = data.columns
		for(var i = 0; i <= values.length -1; i++){
			if(values[i][columns.indexOf('type')] === 'stat'){
				var json = {
					x: values[i][0],
					y: parseFloat(values[i][dataPos])
				}
				jsonArray.push(json)
			}
			else{
				console.log('RECEIVED CONTAINER INFO:', values[i])
			}
		}
		return jsonArray
	}

	$scope.memOptions = {
		chart: {
			type: 'lineChart',
			height: 375,
			margin : {
				top: 20,
				right: 30,
				bottom: 40,
				left: 50
			},
			x: function(d){return d3.time.format.iso.parse(d['x'])},
			y: function(d){ return d.y; },
			dispatch: {
				tooltipShow: function(){
					console.log('TOOLTIP SHOW')
				},
				tooltipHide: function(){
					console.log('TOOLTIP HIDE')
				}
			},
			useInteractiveGuideline: true,
			interactive: true,
			// isArea: false,
			useVoronoi: false,
			tooltip: {
				enabled: true,
				contentGenerator: function () { //return html content
					console.log('IN CONTENT GENERATOR')
					return '<h1>HELLO SHANE</h1>';
				},
				position: function () {
					console.log('EVENT:', d3.event)
					return {
						left: d3.event !== null ? d3.event.clientX : 0,
						top: d3.event !== null ? d3.event.clientY : 0
					}
				}
			},
			xAxis: {
				axisLabel: 'Time (hour/minute/second)',
				tickFormat: xTickFormatFunction(),
				axisLabelDistance: 0
			},
			yAxis: {
				axisLabel: 'Memory usage (%)',
				// tickFormat: function(d){
				// 	return d3.format('.02f')(d);
				// },
				axisLabelDistance: -20			},
			forceY: [0, 100]
		},
		title: {
			enable: true,
			text: 'Memory usage (%)'
		}
	}

	$scope.cpuOptions = {
		chart: {
			type: 'lineChart',
			height: 375,
			margin : {
				top: 20,
				right: 30,
				bottom: 40,
				left: 50
			},
			x: function(d){return d3.time.format.iso.parse(d['x'])},
			y: function(d){ return d.y; },
			dispatch: {
				tooltipShow: function(){
					console.log('TOOLTIP SHOW')
				},
				tooltipHide: function(){
					console.log('TOOLTIP HIDE')
				}
			},
			useInteractiveGuideline: true,
			interactive: true,
			// isArea: false,
			useVoronoi: false,
			tooltip: {
				enabled: true,
				contentGenerator: function () { //return html content
					console.log('IN CONTENT GENERATOR')
					return '<h1>HELLO SHANE</h1>';
				},
				position: function () {
					console.log('EVENT:', d3.event)
					return {
						left: d3.event !== null ? d3.event.clientX : 0,
						top: d3.event !== null ? d3.event.clientY : 0
					}
				}
			},
			xAxis: {
				axisLabel: 'Time (hour/minute/second)',
				tickFormat: xTickFormatFunction(),
				axisLabelDistance: 0
			},
			yAxis: {
				axisLabel: 'CPU usage (%)',
				// tickFormat: function(d){
				// 	return d3.format('.02f')(d);
				// },
				axisLabelDistance: -20			},
			forceY: [0, 100]
		},
		title: {
			enable: true,
			text: 'CPU usage (%)'
		}
	}

	$scope.rxBytesOptions = {
		chart: {
			type: 'lineChart',
			height: 375,
			margin : {
				top: 20,
				right: 30,
				bottom: 40,
				left: 60
			},
			x: function(d){return d3.time.format.iso.parse(d['x'])},
			y: function(d){ return d.y; },
			dispatch: {
				tooltipShow: function(){
					console.log('TOOLTIP SHOW')
				},
				tooltipHide: function(){
					console.log('TOOLTIP HIDE')
				}
			},
			useInteractiveGuideline: true,
			interactive: true,
			useVoronoi: false,
			xAxis: {
				axisLabel: 'Time (hour/minute/second)',
				tickFormat: xTickFormatFunction(),
				axisLabelDistance: 0
			},
			yAxis: {
				axisLabel: 'Network bytes received',
				axisLabelDistance: -5
			},
			forceY: [0]
		},
		title: {
			enable: true,
			text: 'Network bytes received'
		}
	}

	function xTickFormatFunction(){
		return function(d){
			 return d3.time.format('%H:%M:%S')(new Date(d))
		}
	}

	$http.get('/api/projects/' + projectId).success(function(project){
		console.log('RESPONSE1:', project)
		var utcTime = dateFromObjectID(project._id)
		$scope.utcTime = utcTime
		$scope.projectDate = parseTime(utcTime, 19)
		$scope.projectName = project.name
		$scope.owner = project.owner
		$scope.id = project._id
		$scope.containers = project.containers.split(';')
		$scope.projectContainerConcat = []
		for (var i = 0; i <= $scope.containers.length - 1; i++) {
			$scope.projectContainerConcat.push(project._id + '.' + $scope.containers[i])
		}
		$scope.containerString = project.containers
	})
	.error(function(data, status, headers, config){
		console.log('ERROR:', status, ':' ,data)
		$location.path('/projects')
	})

	function dateFromObjectID(objectId){
		return new Date(parseInt(objectId.substring(0, 8), 16) * 1000).toISOString()
	}

	$scope.areSame = function(container, name){
		if(container == name){
			return true
		}else{
			return false

		}
	}

	$scope.deleteContainer = function(){
		var deleteContainer = $window.confirm('Delete container: Are you sure?')
		if(deleteContainer){
			console.log('Delete container')
			var updatedContainers = ''
			for (var i = 0; i <= $scope.containers.length - 1; i++) {
				if($scope.containers[i] == $scope.conID){
					//Do nothing to leave it out of updated containers list
				}
				else{
					// updatedContainers.push($scope.containers[i])
					if($scope.containers.length <= 2){
						updatedContainers = $scope.containers[i]
					}
					else{
						updatedContainers = updatedContainers + ';' + $scope.containers[i]
					}
				}
			}
			var newInfo = {
				id: $scope.id,
				name: $scope.projectName,
				owner: $scope.owner,
				conIds: updatedContainers,
				time: $scope.utcTime
			}
			save(newInfo)
			$location.path('/project/' + $scope.id)
		}
		else{
			console.log("Don't delete container")
		}
	}
}])

dockerWatch.factory('SingleContainerService', ["$location", "$http", function($location, $http){
	save = function(newInfo){
		$http.post('/api/projects/editProject', newInfo).then(function(res){
			console.log('RESPONSE:', res)
		})
	}

	return {
		getStat: function(containerId){
			return $http.get('api/stats/getStat/' + containerId)
			.then(function(response){
				var stats = Promise.resolve(response).then(function(v){
					return v.data
				})
				return stats
			})
		},
		getInfo: function(containerId){
			return $http.get('api/stats/getInfo/' + containerId)
			.then(function(response){
				var info = Promise.resolve(response).then(function(v){
					return v.data
				})
				return info
			})
		}
	}
}])