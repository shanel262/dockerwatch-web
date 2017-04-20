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
			console.log('TOKEN:', userToken)
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
})