'use strict'
//setup express
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var validator = require('express-validator')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(validator())
require('../routes')(app)

//setup chai and chai-http
var chai = require('chai')
var expect = chai.expect
var chaihttp = require('chai-http')
chai.use(chaihttp)

//import config
var yaml_config = require('node-yaml-config')
var config = yaml_config.load(__dirname + '/../config.yml')

//connect to MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://' + config.database + '/test')

var Users = require('../api/users/users.controller')

var newUser = {
	"username" : "jtest",
	"name" : "John Test",
	"password" : "password"
}

var existingProject = {
	"_id" : mongoose.Types.ObjectId("58f7b54c1c5d645c84c749b7"), 
	"name" : "Docker", 
	"owner" : "shanel262", 
	"team" : [ { "_id" : "58ee83d920f47b5f12ab614f", "permission" : false } ], 
	"containers" : "2fd;098"
}

var userToken = null

describe('Users', function(){

	before(function(done){
		mongoose.connection.dropDatabase()
		setTimeout(function(){
			mongoose.connection.collection('users').insert(newUser)
			done()
		}, 10)
	})

	describe('Register', function(){
		it('should register a new user', function(done){
			var user = {
				name: 'Shane Lacey',
				username: 'shanel262',
				password: 'password'
			}
			chai.request(app)
			.post('/api/users/register')
			.send(user)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.body).to.not.be.null
				done()
			})
		})

		it('should fail without name', function(done){
			var user = {
				name: '',
				username: 'shanel262',
				password: 'password'
			}
			chai.request(app)
			.post('/api/users/register')
			.send(user)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(400)
				done()
			})
		})

		it('should fail with duplicate username', function(done){
			var user = {
				name: 'Shane Lacey',
				username: 'shanel262',
				password: 'password'
			}
			chai.request(app)
			.post('/api/users/register')
			.send(user)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(400)
				done()
			})
		})
	})

	describe('Login', function(){
		it('should succeed with correct username and password', function(done){
			var user = {
				username: 'shanel262',
				password: 'password'
			}
			chai.request(app)
			.post('/api/users/login')
			.send(user)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(200)
				expect(res.body.token).to.not.be.null
				userToken = res.body.token
				done()
			})
		})

		it('should fail with wrong password', function(done){
			var wrongPass = {
				username: 'shanel262',
				password: 'wrongpass'
			}
			chai.request(app)
			.post('/api/users/login')
			.send(wrongPass)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(401)
				done()
			})
		})

		it('should fail with wrong username', function(done){
			var wrongUsername = {
				username: 'wronguser',
				password: 'password'
			}
			chai.request(app)
			.post('/api/users/login')
			.send(wrongUsername)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(400)
				done()
			})
		})
	})

	describe('Getting all users', function(){
		it('should get all users', function(done){
			chai.request(app)
			.get('/api/users/getUsers')
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(200)
				expect(res.body.length).to.equal(2)
				done()
			})
		})		
	})
})

describe('Projects API', function(){
	// before(function(done){
	// 	mongoose.connection.collection('projects').drop()
	// 	done()
	// })

	describe('New project', function(){
		it('should create a new project', function(done){
			var newProject = {
				name: 'Test new project',
				username: 'New project owner'
			}
			chai.request(app)
			.post('/api/projects/newProject')
			.set('Authorization', 'Bearer ' + userToken)
			.send(newProject)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(201)
				expect(res.body).to.not.be.null
				done()
			})
		})

		it('should fail with incorrect token', function(done){
			var newProject = {
				name: 'Test new project',
				username: 'New project owner'
			}
			chai.request(app)
			.post('/api/projects/newProject')
			.set('Authorization', 'Bearer ' + null)
			.send(newProject)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(500)
				done()
			})
		})
	})

	describe('Get all projects for user id', function(){
		it('should succeed with legit user jwt token', function(done){
			chai.request(app)
			.get('/api/projects/getProjects')
			.set('Authorization', 'Bearer ' + userToken)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.body.length).to.equal(1)
				expect(res.status).to.equal(200)
				done()
			})
		})

		it('should receive error with illegitimate user jwt token', function(done){
			chai.request(app)
			.get('/api/projects/getProjects')
			.set('Authorization', 'Bearer ' + null)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.body.length).to.equal(undefined)
				expect(res.status).to.equal(500)
				done()
			})
		})
	})

	describe('Get a single project', function(){
		before(function(done){
			mongoose.connection.collection('projects').insert(existingProject)
			done()
		})

		it('should return a project using an existing project id', function(done){
			chai.request(app)
			.get('/api/projects/' + existingProject._id)
			.set('Authorization', 'Bearer ' + userToken)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(200)
				expect(res.body.name).to.equal('Docker')
				done()
			})
		})

		it('should not return a project with an non-existent project id', function(done){
			chai.request(app)
			.get('/api/projects/' + "58f7b54c1000045c84c749b7")
			.set('Authorization', 'Bearer ' + userToken)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(404)
				done()
			})
		})

		it('should not return a project with an incorrect project id (no id or incorrect length)', function(done){
			chai.request(app)
			.get('/api/projects/' + "58f7b54c145c84c749b7")
			.set('Authorization', 'Bearer ' + userToken)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(400)
				done()
			})
		})
	})

	describe('Edit project', function(){
		it('should successfully change the name with legit project id', function(done){
			var editProject = {
				name: 'Replace Docker',
				id: existingProject._id,
				conIds: existingProject.containers
			}
			chai.request(app)
			.post('/api/projects/editProject')
			.set('Authorization', 'Bearer ' + userToken)
			.send(editProject)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(200)
				expect(res.body.name).to.equal('Replace Docker')
				done()
			})
		})

		it('should fail with a fake project id', function(done){
			var editProject = {
				name: 'Replace Docker',
				id: '0si93ur9j30j3jjd093jd3',
				conIds: existingProject.containers
			}
			chai.request(app)
			.post('/api/projects/editProject')
			.set('Authorization', 'Bearer ' + userToken)
			.send(editProject)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(500)
				done()
			})
		})
	})

	describe('Adding a container', function(done){
		it('should successfully add a container with legit project id', function(done){
			var editProject = {
				name: existingProject.name,
				id: existingProject._id,
				conIds: existingProject.containers + ';dockerId'
			}
			chai.request(app)
			.post('/api/projects/editProject')
			.set('Authorization', 'Bearer ' + userToken)
			.send(editProject)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(200)
				var cons = res.body.containers.split(';')
				expect(cons[2]).to.equal('dockerId')
				done()
			})
		})

		it('should fail with a fake project id', function(done){
			var editProject = {
				name: 'Docker',
				id: '0si93ur9j30j3jjd093jd3',
				conIds: existingProject.containers + ';dockerId'
			}
			chai.request(app)
			.post('/api/projects/editProject')
			.set('Authorization', 'Bearer ' + userToken)
			.send(editProject)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(500)
				done()
			})
		})
	})

	describe('Removing a container', function(){
		it('should remove successfully with a legit project id', function(done){
			var editProject = {
				name: existingProject.name,
				id: existingProject._id,
				conIds: existingProject.containers
			}
			chai.request(app)
			.post('/api/projects/editProject')
			.set('Authorization', 'Bearer ' + userToken)
			.send(editProject)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(200)
				var cons = res.body.containers.split(';')
				expect(cons.length).to.equal(2)
				done()
			})
		})

		it('should fail with a fake project id', function(done){
			var editProject = {
				name: existingProject.name,
				id: '0si93ur9j30j3jjd093jd3',
				conIds: existingProject.containers
			}
			chai.request(app)
			.post('/api/projects/editProject')
			.set('Authorization', 'Bearer ' + userToken)
			.send(editProject)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(500)
				done()
			})
		})
	})

	describe('Adding a user to a project', function(){
		it('should succeed with a legit project id and 1 user', function(done){
			var user = [ { "_id" : "58f923e279912e0efd67bf71", "permission" : false },
						{ "id" : "58f7b54c1c5d645c84c749b7"} ]
			chai.request(app)
			.post('/api/projects/addUsers')
			.set('Authorization', 'Bearer ' + userToken)
			.send(user)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(200)
				expect(res.body.team.length).to.equal(2)
				done()
			})
		})

		it('should succeed with a legit project id and 2 users', function(done){
			var user = [ { "_id" : "58f9241179912e0efd67bf73", "permission" : false },
						{ "_id" : "58f9241b79912e0efd67bf74", "permission" : true },
						{ "id" : "58f7b54c1c5d645c84c749b7"} ]
			chai.request(app)
			.post('/api/projects/addUsers')
			.set('Authorization', 'Bearer ' + userToken)
			.send(user)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(200)
				expect(res.body.team.length).to.equal(4)
				done()
			})
		})

		it('should fail with a null token', function(done){
			var user = [ { "_id" : "58f9241179912e0efd67bf75", "permission" : false },
						{ "id" : "58f7b54c1c5d645c84c749b7"} ]
			chai.request(app)
			.post('/api/projects/addUsers')
			.set('Authorization', 'Bearer ' + null)
			.send(user)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(500)
				done()
			})
		})
	})

	describe('Change a users permission', function(){
		it('should succeed and change user permission to true', function(done){
			var changePerm = {
				projectId: "58f7b54c1c5d645c84c749b7",
				userId: "58f9241179912e0efd67bf73",
				permission: true
			}
			chai.request(app)
			.post('/api/projects/changePerm')
			.set('Authorization', 'Bearer ' + userToken)
			.send(changePerm)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(200)
				expect(res.body.nModified).to.equal(1)
				done()
			})
		})

		it('should fail with incorrect project id', function(done){
			var changePerm = {
				projectId: "58f7b54c1c5d645c84c70000",
				userId: "58f9241179912e0efd67bf73",
				permission: true
			}
			chai.request(app)
			.post('/api/projects/changePerm')
			.set('Authorization', 'Bearer ' + userToken)
			.send(changePerm)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(400)
				expect(res.body.nModified).to.equal(0)
				done()
			})
		})

		it('should fail with fake user id', function(done){
			var changePerm = {
				projectId: "58f7b54c1c5d645c84c749b7",
				userId: "58f9241179912e0efd670000",
				permission: true
			}
			chai.request(app)
			.post('/api/projects/changePerm')
			.set('Authorization', 'Bearer ' + userToken)
			.send(changePerm)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(400)
				expect(res.body.nModified).to.equal(0)
				done()
			})
		})

		// it('should fail with permission as a string and not boolean', function(done){
		// 	var changePerm = {
		// 		projectId: "58f7b54c1c5d645c84c749b7",
		// 		userId: "58f9241179912e0efd67bf73",
		// 		permission: 'true'
		// 	}
		// 	chai.request(app)
		// 	.post('/api/projects/changePerm')
		// 	.set('Authorization', 'Bearer ' + userToken)
		// 	.send(changePerm)
		// 	.end(function(err, res){
		// 		console.log('ERR501:', err, res.body)
		// 		expect(err).to.not.be.null
		// 		expect(res.status).to.equal(400)
		// 		expect(res.body.nModified).to.equal(0)
		// 		done()
		// 	})
		// })
	})

	describe('Delete a user from a project', function(){
		it('should successfully delete a user from a project', function(done){
			var user = {
				projectId: "58f7b54c1c5d645c84c749b7",
				_id: "58f9241179912e0efd67bf73"
			}
			chai.request(app)
			.post('/api/projects/deleteUser')
			.set('Authorization', 'Bearer ' + userToken)
			.send(user)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(200)
				expect(res.body.nModified).to.equal(1)
				done()
			})
		})

		it('should fail with a fake project id', function(done){
			var user = {
				projectId: "58f7b54c1c5d645c84c70000",
				_id: "58f9241179912e0efd67bf73"
			}
			chai.request(app)
			.post('/api/projects/deleteUser')
			.set('Authorization', 'Bearer ' + userToken)
			.send(user)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(400)
				expect(res.body.nModified).to.equal(0)
				done()
			})
		})

		// it('should fail with a fake user id', function(done){
		// 	var user = {
		// 		projectId: "58f7b54c1c5d645c84c749b7",
		// 		_id: "58f9241179912e0efd670000"
		// 	}
		// 	chai.request(app)
		// 	.post('/api/projects/deleteUser')
		// 	.set('Authorization', 'Bearer ' + userToken)
		// 	.send(user)
		// 	.end(function(err, res){
		// 		console.log('ERR555:', err, res.body)
		// 		expect(err).to.not.be.null
		// 		expect(res.status).to.equal(400)
		// 		expect(res.body.nModified).to.equal(0)
		// 		done()
		// 	})
		// })

		it('should fail with a null token', function(done){
			var user = {
				projectId: "58f7b54c1c5d645c84c749b7",
				_id: "58f9241179912e0efd67bf73"
			}
			chai.request(app)
			.post('/api/projects/deleteUser')
			.set('Authorization', 'Bearer ' + null)
			.send(user)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(500)
				done()
			})
		})
	})

	describe('Deleting a project', function(){
		it('should fail to delete a project with a fake project id', function(done){
			chai.request(app)
			.delete('/api/projects/deleteProject/' + '58f7b54c1c5d645c84c70000')
			.set('Authorization', 'Bearer ' + userToken)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(400)
				expect(res.body.n).to.equal(0)
				done()
			})
		})

		it('should fail to delete a project with a null token', function(done){
			chai.request(app)
			.delete('/api/projects/deleteProject/' + '58f7b54c1c5d645c84c749b7')
			.set('Authorization', 'Bearer ' + null)
			.end(function(err, res){
				expect(err).to.not.be.null
				expect(res.status).to.equal(500)
				done()
			})
		})

		it('should delete a project with a legit id', function(done){
			chai.request(app)
			.delete('/api/projects/deleteProject/' + '58f7b54c1c5d645c84c749b7')
			.set('Authorization', 'Bearer ' + userToken)
			.end(function(err, res){
				expect(err).to.be.null
				expect(res.status).to.equal(200)
				expect(res.body.n).to.equal(1)
				done()
			})
		})
	})
})