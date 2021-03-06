var uuid = require('uuid/v4') //Probably don't need this anymore
var moment = require('moment')
var Project = require('./projects.model')
var project = new Project()
var jwt = require('jwt-simple');

function handleError(res, err) {
  return res.status(500).json(err);
}

exports.getProjects = function(req, res){
	var token = req.headers.authorization.substring(11)
	var decoded = jwt.decode(token, 'MY_SECRET');
	// console.log('AT getProjects API:', decoded._id)
	Project.find({'team._id': decoded._id}, function(err, projects){
		if(err){return handleError(err)}
		else{
			console.log('Found projects:', projects)
			return res.status(200).json(projects)
		}
	})
}

exports.newProject = function(req, res){
	console.log('AT newProject API:', req.body)
	var token = req.headers.authorization.substring(11)
	var decoded = jwt.decode(token, 'MY_SECRET');
	req.sanitize('name').escape()
	var project = {
		name: req.body.name,
		owner: decoded.username,
		team: [{_id: decoded._id, permission: true}]
	}
	Project.create(project, function(err, response){
		if(err){return handleError(res, err)}
		console.log('Project created:', response)
		return res.status(201).json(response)
	})
}

exports.getSingleProject = function(req, res){
	// console.log('Params:', req.params)
	var token = req.headers.authorization.substring(11)
	var decoded = jwt.decode(token, 'MY_SECRET');
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
	// console.log('AT editProject API:', req.body)
	var token = req.headers.authorization.substring(11)
	var decoded = jwt.decode(token, 'MY_SECRET');
	req.sanitize('name').escape()
	req.sanitize('conIds').escape()
	Project.findById(req.body.id, function(err, project){
		if(err){handleError(res, err)}
		else{
			project.name = req.body.name
			project.containers = req.body.conIds
			project.save(function(err){
				if(err){handleError(res, err)}
				else{
					console.log('Update successful:', project)
					return res.status(200).json(project)				
				}
			})			
		}
	})
}

exports.deleteProject = function(req, res){
	var token = req.headers.authorization.substring(11)
	var decoded = jwt.decode(token, 'MY_SECRET');
	if(req.params.id != "undefined"){
		Project.remove({_id: req.params.id}, function(err, project){
			if(err){handleError(res, err)}
			else if(project.result.n == 1){
				// console.log('Project removed:', project)
				return res.status(200).json(project)
			}
			else{
				return res.status(400).json(project)
			}
		})
	}
	else{return res.status(400).send("No project ID provided")}
	
}

exports.addUsers = function(req, res){
	// console.log('AT addUsers API:', req.body)
	var token = req.headers.authorization.substring(11)
	var decoded = jwt.decode(token, 'MY_SECRET');
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
				project.team.push(add)
				if(user == req.body.length - 1){
					project.save(function(err){
						if(err){handleError(res, err)}
						else{
							console.log('Users added')
							return res.status(200).json(project)
						}
					})
				}
			}
		}
	})
}

exports.deleteUser = function(req, res){
	// console.log('AT deleteUser API:', req.body)
	var token = req.headers.authorization.substring(11)
	var decoded = jwt.decode(token, 'MY_SECRET');
	Project.update({_id: req.body.projectId}, {$pull: {team: {_id: req.body._id}}}, {safe: true},
		function(err, project){
			if(err){handleError(res, err)}
			else if(project.nModified == 0){
				return res.status(400).json(project)
			}
			else{
				console.log('Removed user:', project)
				return res.status(200).json(project)
			}
		}
	)
}

exports.changePerm = function(req, res){
	// console.log('AT changePerm API:', req.body)
	var token = req.headers.authorization.substring(11)
	var decoded = jwt.decode(token, 'MY_SECRET');
	Project.update({_id: req.body.projectId, 'team._id': req.body.userId}, 
		{$set: {'team.$.permission': req.body.permission}}, 
		function(err, project){
			if(err){handleError(res, err)}
			else if(project.nModified == 0){
				return res.status(400).json(project)
			}
			else{
				console.log('Updated permission:', project)
				return res.status(200).json(project)
			}
	})
}
