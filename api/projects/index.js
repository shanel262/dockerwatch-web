var express = require('express');
var controller = require('./projects.controller');

var router = express.Router();

router.get('/getProjects', controller.getProjects) //Get stats for specific container

module.exports = router;