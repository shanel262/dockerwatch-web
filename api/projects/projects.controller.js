var uuid = require('uuid/v4') //Probably don't need this anymore
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
	req.sanitize('name').escape()
	req.sanitize('conIds').escape()
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
	if(req.params.id && req.params.id.length == 24){
		Project.findById(req.params.id, function(err, project){
			if(err){handleError(err)}
			if(project != null){
				console.log('Found single project:', err ,project)
				return res.json(200, project)
			}
			else{return res.json(404, "No project found")}
		})
	}
	else{return res.json(400, "Incorrect project ID")}
	
}

exports.editProject = function(req, res){
	req.sanitize('name').escape()
	req.sanitize('conIds').escape()
	Project.findById(req.body.id, function(err, project){
		if(err){handleError(err)}
		project.name = req.body.name
		project.containers = req.body.conIds
		project.save(function(err){
			if(err){handleError(err)}
			console.log('Update successful:', project)
			return res.json(200, project)
		})
	})
}

exports.deleteProject = function(req, res){
	if(req.params.id != "undefined"){
		Project.findById(req.params.id, function(err, response){
			if(err){handleError(err)}
			response.remove()
			response.save(function(err){
				if(err){handleError(err)}
				console.log('Project removed', req.params.id)
				return res.json(410, response)
			})
		})
	}
	else{return res.json(400, "No project ID provided")}
	
}