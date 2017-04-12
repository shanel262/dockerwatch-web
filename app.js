var express = require('express');

var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
mongoose.connect('mongodb://localhost/dockerwatch');

require('./config/express').addMiddleware(app)
require('./api/users/users.model')
require('./api/users/passport')
app.use(passport.initialize())
require('./routes')(app)

app.listen(4000, function() {
  console.log('Express server listening on port 4000.');
});