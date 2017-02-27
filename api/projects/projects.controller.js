var uuid = require('uuid/v4')
var moment = require('moment')
var Project = require('./projects.model')
var project = new Project()

function handleError(err) {
  console.log(err);
  return res.send(500, err);
}

exports.getProjects = function(req, res){
	Project.find({}, function(err, projects){
		if(err){return handleError(err)}
		return res.json(200, projects)
	})
}

exports.newProject = function(req, res){
	var project = {
		name: req.body.name,
		containers: req.body.conIds,
		owner: 'shanel262'
	}
	Project.create(project, function(err, response){
		if(err){return handleError(err)}
		console.log('Project created:', response)
		return res.json(201, response)
	})
}

exports.getSingleProject = function(req, res){
	Project.findById(req.params.id, function(err, project){
		if(err){handleError(err)}
		console.log('Found single project:', project)
		return res.json(200, project)
	})
}

exports.editProject = function(req, res){
	Project.findById(req.body.id, function(err, project){
		if(err){handleError(err)}
		project.name = req.body.name
		project.containers = req.body.conIds
		project.save(function(err){
			console.log('Update successful:', project)
			return res.json(200, project)
		})
	})
}

exports.deleteProject = function(req, res){
	console.log('DELETE PROJECT:', req.params.id)
	Project.findById(req.params.id, function(err, response){
		if(err){handleError(err)}
		response.remove()
		response.save(function(err){
			if(err){handleError(err)}
			console.log('Project removed')
			return res.json(410, response)
		})
	})
}