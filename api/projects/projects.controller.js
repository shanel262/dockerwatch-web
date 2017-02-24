var influxdb = require('influx').InfluxDB
var uuid = require('uuid/v4')
var moment = require('moment')

var HOST = '127.0.0.1'
var PORT = 8001

var influx = new influxdb({
		host: 'localhost',
		port: 8086,
		username: 'root',
		password: 'root',
		database: 'test'
	})

exports.getProjects = function(req, res){
	var query = 'select * from projects'
	influx.queryRaw([query]).then(results => {
		var stats = Promise.resolve(results).then(function(v){
			console.log('V:', v.results[0].series[0])
			return res.send(200, v.results[0].series[0])
		})
	})
}

exports.newProject = function(req, res){
	var id = uuid()
	influx.writeMeasurement('projects', [
		{
			fields: {uuid: id.toString(), name: req.body.name, containers: req.body.conIds, owner: 'shanel262'}
		}
	])
}

exports.getSingleProject = function(req, res){
	var query = "select * from projects where \"uuid\"='" + req.params.id + "'"
	influx.queryRaw([query], {precision:'ns'}).then(results => {
		var project = Promise.resolve(results).then(function(projectRes){
			console.log('RESULT::', projectRes.results[0].series[0])
			var utcTime = projectRes.results[0].series[0].values[0][0]/1000000
			projectRes.results[0].series[0].timeUtc = moment.utc(utcTime)
			return res.send(200, projectRes.results[0].series[0])
		})
	})
}

exports.editProject = function(req, res){
	console.log('REACHED API:', req.body)
	var newInfo = req.body
	// influx.writeMeasurement('projects', [
	// 	{
	// 		fields: {uuid: newInfo.id, name: newInfo.name, containers: newInfo.conIds, owner: newInfo.owner},
	// 		timestamp: 012
	// 	}
	// ])
}