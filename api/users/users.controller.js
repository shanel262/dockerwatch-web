var passport = require('passport')
var User = require('./users.model')
var jwt = require('jwt-simple');


function handleError(res, err) {
	console.log(err);
	return res.status(500).json(err);
}

exports.register = function(req, res) { 
    console.log(req.body);
    if (!req.body.name || !req.body.password) {
      res.json({success: false, msg: 'Please pass name and password.'});
    } else {
      var newUser = new User({
        name: req.body.name,
        password: req.body.password,
        username: req.body.username
      });
      newUser.save(function(err) {
        if (err) {
          console.log("error : ",err)
          return res.status(301).json({success: false, msg: 'Username already exists.'});
        }
        res.status(200).json({success: true, msg: 'Successful created new user.'});
      });
    }
  };

exports.login = function(req, res){
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.status(500).json({success: false, msg: 'Authentication failed. User not found.'});
    } else {
	      user.comparePassword(req.body.password, function (err, isMatch) {
	        if (isMatch && !err) {
	          var expiry = new Date();
			  expiry.setDate(expiry.getDate() + 7);
	          user.exp = parseInt(expiry.getTime() / 1000)
	          console.log('USER:', user)
	          var token = jwt.encode(user, "MY_SECRET");
	          res.status(200).json({success: true, token: 'JWT ' + token});
	        } else {
	          res.status(500).json({success: false, msg: 'Authentication failed. Wrong password.'});
	        }
      });
    }
})
};

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
