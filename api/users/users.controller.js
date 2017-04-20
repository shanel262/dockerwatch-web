var passport = require('passport')
var User = require('./users.model')


function handleError(res, err) {
	console.log(err);
	return res.status(500).json(err);
}

exports.login = function(req, res){
	console.log('LOGIN API:', req.body)
	passport.authenticate('local', function(err, user, info){
		var token
		if(err){
			return res.status(404).json(err)
		}
		if(user){
			token = user.generateJwt()
			return res.status(200).json({"token": token})
		}
		else{
			return res.status(401).json(info)
		}
	})(req, res)
}

exports.register = function(req, res){
	console.log('REGISTER API:', req.body)
	var user = new User()
	user.name = req.body.name,
	user.username = req.body.username
	user.setPassword(req.body.password)
	user.save(function(err, response){
		// console.log('err api:', err)
		// console.log('response api:', response.body)
		if(err){handleError(res, err)}
		else{
			var token
			token = user.generateJwt()
			res.status(200)
			res.json({
				"token": token
			})			
		}
	})
}

exports.getUsers = function(req, res){
	User.find()
		.select('name username')
		.exec(function(err, users){
		if(err){handleError(res, err)}
		else{
			console.log('Found users:', users)
			return res.status(200).json(users)
		}
	})
}
