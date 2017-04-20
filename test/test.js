'use strict'
//setup express
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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
	"hash" : "a472a1871cfe5e0319226d883b5d6ea25997acbd19cd936a92fa20ae3eaef19ef03710f58650d1757771336c8f3efac3cb73c84037c646bd301cc4414628d8b8",
	"salt" : "f44f13525ce744981494031ecd01db5c",
	"username" : "jtest",
	"name" : "John Test"
}

describe('Users', function(){

	before(function(done){
		mongoose.connection.dropDatabase()
		setTimeout(function(){
			console.log('INSERTING USER')
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
				if(err){done(err)}
				else{
					expect(err).to.be.null
					expect(res.body.token).to.not.be.null
					done()
				}
			})
		})
	})

	describe('Login', function(){
		it('should succeed', function(done){
			var user = {
				username: 'jtest',
				password: 'password'
			}
			chai.request(app)
			.post('/api/users/login')
			.send(user)
			.end(function(err, res){
				console.log('RES:', res)
				expect(err).to.be.null
				expect(res.body).to.not.be.null
				expect(res.status).to.equal(200)
				done()
			})
		})
	})

	// describe('Get all users', function(){
	// 	before(function(done){
	// 		mongoose.connection.dropDatabase()
	// 		var user1 = {name: 'User1', username: 'user1', password: 'password'}
	// 		var user2 = {name: 'User2', username: 'user2', password: 'password'}
	// 		mongoose.connection.collections('users').insert(user1)
	// 	})
	// })
})