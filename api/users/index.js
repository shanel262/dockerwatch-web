var express = require('express');
var controller = require('./users.controller');

var router = express.Router();

router.post('/login', controller.login) //Login user
router.post('/register', controller.register) //Register user

module.exports = router;