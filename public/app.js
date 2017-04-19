var dockerWatch = angular.module('DockerWatch', ['ngRoute', 'nvd3']);

dockerWatch.config(['$routeProvider',
	function($routeProvider){
		$routeProvider
		.when('/login', {
			templateUrl: 'partials/login.html'
		})
		.when('/register', {
			templateUrl: 'partials/register.html'
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
			redirectTo: "/projects"
		})
	}
])

.run(function($rootScope, $location, LoginService){
	$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute){
		var check = isLoggedIn()
		console.log('LOGGED IN USER:', $rootScope.loggedInUser)
		if(check){
			console.log('Continue', check)
			if($location.path() == '/register'){
				$location.path('/projects')
			}
			else if($location.path() == '/login'){
				$location.path('/projects')
			}
		}
		else{
			console.log('No logged in user: Redirect')
			if($location.path() != '/register'){
				if($location.path() != '/login'){
					$location.path('/login')
				}
			}
		}
	})
})

//For Navbar
dockerWatch.controller('NavController', ["$scope", "$location", "$rootScope", function($scope, $location, $rootScope){
	console.log('Loading NavController')
	$scope.logout = function(){
		console.log('Logout:', $rootScope.loggedInUser)
		$rootScope.loggedInUser = null
		window.localStorage.removeItem('token')
		$location.path('/login')
	}
}])

//Login
dockerWatch.controller('LoginController', ["$scope", "LoginService", function($scope, LoginService){
	$scope.username = ''
	$scope.password = ''
	$scope.login = function(){
		console.log('LOGGING IN:', $scope.username, $scope.password)
		var user = {
			username: $scope.username,
			password: $scope.password
		}
		login(user)
		$scope.username = ''
		$scope.password = ''

	}
}])

dockerWatch.factory('LoginService', ["$http", "$location", "$rootScope", function($http, $location, $rootScope){
	login = function(user){
		console.log('Login service:', user)
		$http.post('api/users/login/', user).then(function(res){
			if(res.status == 200){
				console.log('SUCCESSFUL LOGIN', res)
				window.localStorage.setItem('token', res.data.token)
				$location.path('/projects')
			}
			else if(res.status == 401 || res.status == 404){
				console.log('FAILED LOGIN', res)
			}
		})
	}
	isLoggedIn = function(){
		var token = window.localStorage.getItem('token')
		var payload
		if(token){
			payload = token.split('.')[1]
			payload = window.atob(payload)
			payload = JSON.parse(payload)
			console.log('PAYLOAD:', payload)
			if(payload.exp > Date.now() / 1000){
				console.log('Valid token')
				$rootScope.loggedInUser = {
					id: payload._id,
					name: payload.name,
					username: payload.username
				}
				return true
			}
			else{
				console.log('Invalid token')
				return false
			}
		}
		else{
			console.log('NO TOKEN')
			return false
		}
	}
}])

//Register
dockerWatch.controller('RegisterController', ["$scope", "RegisterService", function($scope, RegisterService){
	$scope.name = ''
	$scope.username = ''
	$scope.password = ''
	$scope.register = function(){
		console.log('LOGGING IN:', $scope.username, $scope.password)
		var user = {
			name: $scope.name,
			username: $scope.username,
			password: $scope.password
		}
		register(user)
		$scope.name = ''
		$scope.username = ''
		$scope.password = ''
	}
}])

dockerWatch.factory('RegisterService', ["$http", "$location", function($http, $location){
	register = function(user){
		console.log('Register service:', user)
		$http.post('api/users/register/', user).then(function(res){
			console.log('RETURNED:', res)
			if(res.status == 200){
				console.log('SUCCESSFUL REGISTRATION')
				$location.path('/login')
			}
			else{
				console.log('FAILED REGISTRATION', res)
			}
		})
	}
}])

//Projects
dockerWatch.controller('ProjectsController', ["$scope", "ProjectsService", "$timeout", "$location", "$rootScope", function($scope, ProjectsService, $timeout, $location, $rootScope){
	$scope.projects = []
	function getProjects(){
		ProjectsService.getProjects($rootScope.loggedInUser.id).then(function(res){
			var projects = []
			for (projectIndex in res.data){
				try{
					var containers = res.data[projectIndex].containers.split(';')
					if(containers.length == 1 && containers[0] == ""){
						containers = []
					}
				}
				catch(err){
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
		getProjects: function(userId){
			return $http({
				method: 'GET',
				url: 'api/projects/getProjects/' + userId
			})
			.success(function(res){
				console.log('Successfully retrieved projects:', res)
				return res
			})
			.error(function(res){
				console.log('Failed to get projects:', res)
				return res
			})
		}
	}
}])


//New Projects
dockerWatch.controller('NewProjectsController', ["$scope", "NewProjectsService", "$rootScope", function($scope, NewProjectsService, $rootScope){
	$scope.addNewProject = function(){
		var project = {
			name: $scope.name,
			user: $rootScope.loggedInUser
		}
		createProject(project)
		$scope.name = ""
	}
}])

dockerWatch.factory('NewProjectsService', ["$http", "$location", function($http, $location){
	createProject = function(project){
		$http({
			method: 'POST',
			url: 'api/projects/newProject/',
			data: project
		})
		.success(function(res){
			console.log('Successfully added project:', res)
			$location.path('/projects')
		})
		.error(function(res){
			console.log('Failed to add project:', res)
		})
	}
	// return {

	// }
}])

//Single project
dockerWatch.controller('SingleProjectController', ["$scope", "SingleProjectService", "$routeParams", "$http", "$timeout", "$location", "$window", "$route", "$rootScope", function($scope, SingleProjectService, $routeParams, $http, $timeout, $location, $window, $route, $rootScope){
	$http.get('/api/projects/' + $routeParams.projectID).success(function(project){
		console.log('RESPONSE1:', project)
		var utcTime = dateFromObjectID(project._id)
		$scope.utcTime = utcTime
		$scope.date = utcTime.substring(0, 10)
		$scope.time = utcTime.substring(11, 19)
		$scope.name = project.name
		$scope.owner = project.owner
		$scope.id = project._id
		$scope.team = project.team
		$scope.team.forEach(function(user){
			if(user._id == $rootScope.loggedInUser.id){
				$rootScope.loggedInUser.permission = user.permission
				console.log('found it:', $scope.loggedInUser.permission)
			}
		})
		try{
			$scope.containers = project.containers.split(';')
			if($scope.containers.length == 1 && $scope.containers[0] == ""){
				$scope.containers = []
			}
		}
		catch(err){
			// console.log('CANNOT READ CONTAINERS:', err)
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
			console.log('It does not exist in influx', res)
			$scope.status = 'failure'
		}
		else if(res.data.length == 2){
			console.log('It does exist in influx', res)
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
			console.log('Unexpected response', res)
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

dockerWatch.controller('AddUserToProjectController', ["$scope", "AddUserToProjectService", "$http", function($scope, AddUserToProjectService, $http){
	$http({
		method: 'GET',
		url: '/api/users/getUsers'
	})
	.success(function(res){
		$scope.users = []
		var dontInclude = []
		$scope.projectTeam = []
		$scope.team.forEach(function(user){
			dontInclude.push(user._id)
		})
		for(var user = 0; user < res.length; user++){	
			if(!dontInclude.includes(res[user]._id)){
				$scope.users.push(res[user])
			}
			else{
				var search = res[user]._id
				var obj = $scope.team.filter(function(obj){
					return obj._id === search
				})
				res[user].permission = obj[0].permission
				$scope.projectTeam.push(res[user])
			}
		}
	})
	.error(function(res){
		console.log('Failed to get users:', res)
	})

	$scope.addUser = function(){
		console.log('ADD USER:', $scope.add, $scope.write)
		var users = []
		Object.keys($scope.add).forEach(function(key){
			if($scope.add[key] == true){
				var user = {
					_id: key,
					permission: ($scope.write[key] == true) ? true : false
				}
				users.push(user)
			}
		})
		var projectId = {id: $scope.id}
		users.push(projectId)
		console.log('users:', users)
		if(users.length > 1){
			addUser(users)
		}
	}
	$scope.add = {}
	$scope.write = {}

	$scope.deleteUser = function(user){
		console.log('DELETE USER:', user)
		var userToDelete = {
			_id: user,
			projectId: $scope.id
		}
		deleteUser(userToDelete)
	}

	$scope.changePerm = function(user){
		console.log('CHANGE PERM:', user)
		var projAndPerm = {
			projectId: $scope.id,
			userId: user._id
		}
		if(user.permission == true){
			projAndPerm.permission = false
		}
		else{
			projAndPerm.permission = true
		}
		console.log('projAndPerm:', projAndPerm)
		changePerm(projAndPerm)
	}
}])

dockerWatch.factory('AddUserToProjectService', ["$http", function($http){
	addUser = function(users){
		$http({
			method: 'POST',
			url: '/api/projects/addUsers',
			data: users
		})
		.success(function(res){
			console.log('Successfully added:', res)
			window.location.reload()
		})
		.error(function(res){
			console.log('Failed to add:', res)
		})
	}
	deleteUser = function(user){
		$http({
			method: 'POST',
			url: '/api/projects/deleteUser',
			data: user
		})
		.success(function(res){
			console.log('Successfully deleted:', res)
			window.location.reload()
		})
		.error(function(res){
			console.log('Failed to delete user:', res)
		})
	}
	changePerm = function(projAndPerm){
		$http({
			method: 'POST',
			url: '/api/projects/changePerm',
			data: projAndPerm
		})
		.success(function(res){
			console.log('Successfully changed permission:', res)
			window.location.reload()
		})
		.error(function(res){
			console.log('Failed to change permission', res)
		})
	}
}])

//Single Container View
dockerWatch.controller('SingleContainerController', ["$scope", "SingleContainerService", "$route", "$timeout", "$routeParams", "$http", "$window", "$location", function($scope, SingleContainerService, $route, $timeout, $routeParams, $http, $window, $location){
	var split = $routeParams.containerID.split('.')
	var projectId = split[0]
	var containerId = split[1]
	$scope.containerId = containerId
	var mostRecentTime = 0
	$scope.showGraphs = {
		cpu: true,
		mem: true,
		bytes: true,
		packets: true,
		dropped: true,
		error: true
	}
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
		$scope.containerId
		 = res.name
		$scope.dateTime = parseTime(res.values[0][0], 25)
		//CPU
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
		$scope.cpuPerc = res.values[0][res.columns.indexOf('cpu')]
		//Mem
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
		$scope.memBytes = parseSize(res.values[0][res.columns.indexOf('memBytes')])
		$scope.memPerc = res.values[0][res.columns.indexOf('memPerc')]
		//Network
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
		$scope.rxParsed = parseSize(res.values[0][res.columns.indexOf('rxBytes')])
		$scope.txParsed = parseSize(res.values[0][res.columns.indexOf('txBytes')])
		var rxPackets = parseInfluxData(res, res.columns.indexOf('rxPackets'))
		var txPackets = parseInfluxData(res, res.columns.indexOf('txPackets'))
		$scope.packetsData = [
			{
				values: rxPackets,
				key: 'Packets received'
			},
			{
				values: txPackets,
				key: 'Packets sent'
			}
		]
		var rxDropped = parseInfluxData(res, res.columns.indexOf('rxDropped'))
		var txDropped = parseInfluxData(res, res.columns.indexOf('txDropped'))
		$scope.droppedData = [
			{
				values: rxDropped,
				key: 'Incoming packets dropped'
			},
			{
				values: txDropped,
				key: 'Outgoing packets dropped'
			}
		]
		var rxError = parseInfluxData(res, res.columns.indexOf('rxError'))
		var txError = parseInfluxData(res, res.columns.indexOf('txError'))
		$scope.errorData = [
			{
				values: rxError,
				key: 'Incoming errors'
			},
			{
				values: txError,
				key: 'Outgoing errors'
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
		$scope.memLimit = (res.values[0][columns.indexOf('memLimit')] !== 0) ? parseSize(res.values[0][columns.indexOf('memLimit')]) : 'NA'
		var currentTime = new Date()
		$scope.lastUpdatedAt = currentTime.toUTCString()
		$scope.$apply()
		$timeout(function(){
			getInfo()
		}, 300000) //Wait 5 minutes
	}
	getStat()
	getInfo()

	function parseSize(mem){
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
			useInteractiveGuideline: false,
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
			useInteractiveGuideline: false,
			interactive: true,
			// isArea: false,
			useVoronoi: false,
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
				axisLabelDistance: -20
			},
			forceY: [0, 100]
		},
		title: {
			enable: true,
			text: 'CPU usage (%)'
		}
	}

	$scope.bytesOptions = {
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
			useInteractiveGuideline: false,
			interactive: true,
			useVoronoi: false,
			xAxis: {
				axisLabel: 'Time (hour/minute/second)',
				tickFormat: xTickFormatFunction(),
				axisLabelDistance: 0
			},
			yAxis: {
				axisLabel: 'Network bytes',
				axisLabelDistance: -5
			},
			forceY: [0]
		},
		title: {
			enable: true,
			text: 'Network bytes'
		}
	}

	$scope.packetsOptions = {
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
			useInteractiveGuideline: false,
			interactive: true,
			useVoronoi: false,
			xAxis: {
				axisLabel: 'Time (hour/minute/second)',
				tickFormat: xTickFormatFunction(),
				axisLabelDistance: 0
			},
			yAxis: {
				axisLabel: 'Network packets',
				axisLabelDistance: -5
			},
			forceY: [0]
		},
		title: {
			enable: true,
			text: 'Network packets'
		}
	}

	$scope.droppedOptions = {
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
			useInteractiveGuideline: false,
			interactive: true,
			useVoronoi: false,
			xAxis: {
				axisLabel: 'Time (hour/minute/second)',
				tickFormat: xTickFormatFunction(),
				axisLabelDistance: 0
			},
			yAxis: {
				axisLabel: 'Network packets dropped',
				axisLabelDistance: -5
			},
			forceY: [0]
		},
		title: {
			enable: true,
			text: 'Network packets dropped'
		}
	}

	$scope.errorOptions = {
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
			useInteractiveGuideline: false,
			interactive: true,
			useVoronoi: false,
			xAxis: {
				axisLabel: 'Time (hour/minute/second)',
				tickFormat: xTickFormatFunction(),
				axisLabelDistance: 0
			},
			yAxis: {
				axisLabel: 'Network errors',
				axisLabelDistance: -5
			},
			forceY: [0]
		},
		title: {
			enable: true,
			text: 'Network errors'
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
				if($scope.containers[i] == $scope.containerId){
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