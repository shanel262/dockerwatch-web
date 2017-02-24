var express = require('express');
var controller = require('./projects.controller');

var router = express.Router();

router.get('/getProjects', controller.getProjects) //Get stats for specific container
router.post('/newProject', controller.newProject) //Get stats for specific container
router.get('/:id', controller.getSingleProject) //Get a single project
router.post('/editProject', controller.editProject) //Edit a single project

module.exports = router;