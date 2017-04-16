var express = require('express');

var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var yaml_config = require('node-yaml-config')
var config = yaml_config.load(__dirname + '/config.yml')
mongoose.connect('mongodb://' + config.mongodb + '/dockerwatch');

require('./config/express').addMiddleware(app)
require('./api/users/users.model')
require('./api/users/passport')
app.use(passport.initialize())
require('./routes')(app)

app.listen(4000, function() {
  console.log('Express server listening on port 4000.');
});
