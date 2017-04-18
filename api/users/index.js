var express = require('express');
var controller = require('./users.controller');

var router = express.Router();

router.post('/login', controller.login) //Login user
router.post('/register', controller.register) //Register user
router.get('/getUsers', controller.getUsers) //Get users

module.exports = router;