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

exports.getStat = function(req, res){
	var containerId = req.params.containerId
	var query = 'select * from "' + containerId + '"' + " WHERE type='stat' ORDER BY time DESC LIMIT 10"
	influx.queryRaw(query).then(results => {
		var stats = Promise.resolve(results).then(function(v){
			return v.results[0].series[0]
		}).then(function(stats){
			return res.send(200, stats)			
		})
	})
}

exports.getInfo = function(req, res){
	var containerId = req.params.containerId
	var query = 'select * from "' + containerId + '"' + " WHERE type='info' ORDER BY time DESC LIMIT 1"
	influx.queryRaw(query).then(results => {
		var stats = Promise.resolve(results).then(function(v){
			return v.results[0].series[0]
		}).then(function(stats){
			return res.send(200, stats)			
		})
	})
}

exports.checkContainer = function(req, res){
	req.sanitize('containerId').escape()
	influx.getSeries({measurement: req.params.containerId}).then(series => {
		return res.send(200, series)
	})
}