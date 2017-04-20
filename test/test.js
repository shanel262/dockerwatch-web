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
	"username" : "jtest",
	"name" : "John Test",
	"password" : "password"
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
					console.log('RES:', res.body)
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
				username: 'shanel262',
				password: 'password'
			}
			chai.request(app)
			.post('/api/users/login')
			.send(user)
			.end(function(err, res){
				console.log('RES:', res.body)
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