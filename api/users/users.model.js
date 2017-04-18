var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var crypto = require('crypto')
var jwt = require('jsonwebtoken');

var UsersSchema = new Schema({
	name: { type: String, required: true } ,
	username: { type: String, unique: true, required: true } ,
	hash: String,
	salt: String
});

UsersSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex')
}

UsersSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex')
  return this.hash === hash
}

UsersSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000),
  }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

module.exports = mongoose.model('users', UsersSchema);