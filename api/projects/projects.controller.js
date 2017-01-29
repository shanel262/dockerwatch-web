var influxdb = require('influx').InfluxDB

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