var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('users');

passport.use(new LocalStrategy(
	function(username, password, done){
		User.findOne({username: username}, function(err, user){
			if(err) {return done(err)}
			if(!user){
				return done(null, false, {
					message: 'User not found'
				})
			}
			if(!user.validPassword(password)){
				return done(null, false, {
					message: 'Password is incorrect'
				})
			}
			return done(null, user)
		})
	}
))