var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var morgan = require('morgan');
var validator = require('express-validator')
var favicon = require('serve-favicon')

exports.addMiddleware = function(app) {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(morgan('dev'));
  app.use(cookieParser());
  app.use(express.static('public'));
  app.use(favicon(__dirname + '/../public/images/favicon.ico'))
  app.use(errorHandler()); // Error handler - has to be last
  app.use(validator())
}