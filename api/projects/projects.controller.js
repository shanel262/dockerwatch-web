var uuid = require('uuid/v4') //Probably don't need this anymore
var moment = require('moment')
var Project = require('./projects.model')
var project = new Project()

function handleError(res, err) {
  return res.send(500, err);
}

exports.getProjects = function(req, res){
	Project.find({}, function(err, projects){
		if(err){return handleError(err)}
		return res.json(200, projects)
	})
}

exports.newProject = function(req, res){
	console.log('AT newProject API:', req.body)
	req.sanitize('name').escape()
	var project = {
		name: req.body.name,
		owner: req.body.user.username,
		team: [{_id: req.body.user.id, permission: true}]
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

exports.addUsers = function(req, res){
	console.log('AT addUsers API:', req.body)
	var projectId = req.body.pop()
	Project.findById(projectId.id, function(err, project){
		if(err){handleError(res, err)}
		else{
			console.log('Found project:', project)
			for(var user = 0; user < req.body.length; user++){
				var add = {
					_id: req.body[user]._id,
					permission: req.body[user].permission
				}
				console.log('ADD:', user, add)
				project.team.push(add)
				if(user == req.body.length - 1){
					project.save(function(err){
						if(err){handleError(res, err)}
						else{
							console.log('Users added')
							return res.send(200).json(project)
						}
					})
				}
			}
		}
	})
}

exports.deleteUser = function(req, res){
	console.log('AT deleteUser API:', req.body)
	Project.update({_id: req.body.projectId}, {$pull: {team: {_id: req.body._id}}}, {safe: true},
		function(err, project){
			if(err){handleError(res, err)}
			else{
				console.log('Removed user:', project)
				return res.status(200).json(project)
			}
		}
	)
}
