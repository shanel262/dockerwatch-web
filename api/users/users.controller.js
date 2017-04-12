var User = require('./users.model')
var user = new User()

function handleError(err) {
  console.log(err);
  return res.send(500, err);
}

exports.login = function(req, res){
	console.log('LOGIN API:', req.body)
	return res.json(200, 'LOGIN API SUCCESS')
}

exports.register = function(req, res){
	console.log('REGISTER API:', req.body)
	return res.json(200, 'REGISTER API SUCCESS')
}
