var influxdb = require('influx').InfluxDB
var uuid = require('uuid/v4')

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
	influx.queryRaw(query).then(results => {
		var stats = Promise.resolve(results).then(function(v){
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