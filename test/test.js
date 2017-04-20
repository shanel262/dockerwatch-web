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
mongoose.connect('mongodb://' + config.database + '/test');

describe('Users', function(){
	it('should register a user', function(done){
		chai.request(app)
		.post('/api/users/register')
		.send({name: 'Shane Lacey', username: 'testShane', password: 'testPass'})
		.end(function(err, res){
			if(err){console.log('ERR:', err)}
			else{
				console.log('RES:', res.body)
				expect(res.body).to.not.be.null
			}
			done()
		})
	})
	it('Should return all users', function(done){
		chai.request(app)
		.get('/api/users/getUsers')
		.end(function(err, res){
			if(err){console.log('ERR:', err)}
			else{
				console.log('RES:', res.body)
				expect(res.body.length).to.equal(1)
			}
			done()
		})
	})
})