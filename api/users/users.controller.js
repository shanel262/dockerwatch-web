var passport = require('passport')
var User = require('./users.model')
var jwt = require('jwt-simple');


function handleError(res, err) {
	console.log(err);
	return res.status(500).json(err);
}

exports.register = function(req, res){
	if(!req.body.name || !req.body.password || !req.body.username){
		res.status(400).send('Must submit name, password and username')
	}
	else{
		var newUser = new User({
			name: req.body.name,
			username: req.body.username,
			password: req.body.password
		})
		newUser.save(function(err){
			if(err){return res.status(400).send('Username already exists')}
			else{
				console.log('Registered user:', newUser)
				return res.status(200).send('Successfully created user:' + newUser)
			}
		})
	}
}

// exports.login = function(req, res){
//   User.findOne({
//     username: req.body.username
//   }, function(err, user) {
//     if (err) throw err;
 
//     if (!user) {
//       res.status(401).json({success: false, msg: 'Authentication failed. User not found.'});
//     } else {
// 	      user.comparePassword(req.body.password, function (err, isMatch) {
// 	        if (isMatch && !err) {
// 	          var expiry = new Date();
// 			  expiry.setDate(expiry.getDate() + 7);
// 	          user.exp = parseInt(expiry.getTime() / 1000)
// 	          console.log('USER:', user)
// 	          var token = jwt.encode(user, "MY_SECRET");
// 	          res.status(200).json({success: true, token: 'JWT ' + token});
// 	        } else {
// 	          res.status(401).json({success: false, msg: 'Authentication failed. Wrong password.'});
// 	        }
//       });
//     }
// })
// };

exports.login = function(req, res){
	User.findOne({username: req.body.username}, function(err, user){
		if(err){handleError(res, err)}
		else if(!user){
			// console.log('User does not exist')
			return res.status(400).send('User does not exist')
		}
		else{
			user.comparePassword(req.body.password, function(err, success){
				if(!success){
					// console.log('Incorrect password')
					return res.status(401).send('Incorrect password')
				}
				else{
					// console.log('User logged in:', user)
					var token = jwt.encode(user, "MY_SECRET")
					return res.status(200).send({token: 'JWT ' + token})
				}
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
			// console.log('Found users:', users)
			return res.status(200).send(users)
		}
	})
}

// exports.login = function(req, res){
// 	console.log('LOGIN API:', req.body)
// 	passport.authenticate('local', function(err, user, info){
// 		var token
// 		if(err){
// 			return res.status(404).json(err)
// 		}
// 		if(user){
// 			token = user.generateJwt()
// 			return res.status(200).json({"token": token})
// 		}
// 		else{
// 			return res.status(401).json(info)
// 		}
// 	})(req, res)
// }

// exports.register = function(req, res){
// 	console.log('REGISTER API:', req.body)
// 	var user = new User()
// 	user.name = req.body.name,
// 	user.username = req.body.username
// 	user.setPassword(req.body.password)
// 	user.save(function(err, response){
// 		// console.log('err api:', err)
// 		// console.log('response api:', response.body)
// 		if(err){handleError(res, err)}
// 		else{
// 			var token
// 			token = user.generateJwt()
// 			res.status(200)
// 			res.json({
// 				"token": token
// 			})			
// 		}
// 	})
// }
