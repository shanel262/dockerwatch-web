var bcrypt = require('bcrypt');
var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
mongoose.Promise = global.Promise;

var UsersSchema = new Schema({
  name: { type: String, required: true } ,
  username: { type: String, unique: true, required: true } ,
  password: { type: String, required: true }
});

module.exports = mongoose.model('users', UsersSchema);

UsersSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});
 
UsersSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};
 
module.exports = mongoose.model('User', UsersSchema);

// var mongoose = require('mongoose')
// mongoose.Promise = global.Promise;
// var Schema = mongoose.Schema;
// var crypto = require('crypto')
// var jwt = require('jsonwebtoken');

// var UsersSchema = new Schema({
// 	name: { type: String, required: true } ,
// 	username: { type: String, unique: true, required: true } ,
// 	hash: String,
// 	salt: String
// });

// UsersSchema.methods.setPassword = function(password){
//   this.salt = crypto.randomBytes(16).toString('hex')
//   this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex')
// }

// UsersSchema.methods.validPassword = function(password) {
//   var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex')
//   return this.hash === hash
// }

// UsersSchema.methods.generateJwt = function() {
//   var expiry = new Date();
//   expiry.setDate(expiry.getDate() + 7);

//   return jwt.sign({
//     _id: this._id,
//     username: this.username,
//     name: this.name,
//     exp: parseInt(expiry.getTime() / 1000),
//   }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
// };

// module.exports = mongoose.model('users', UsersSchema);