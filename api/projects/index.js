var express = require('express');
var controller = require('./projects.controller');

var router = express.Router();

router.get('/getProjects/:userId', controller.getProjects) //Get stats for specific container
router.post('/newProject', controller.newProject) //Get stats for specific container
router.get('/:id', controller.getSingleProject) //Get a single project
router.post('/editProject', controller.editProject) //Edit a single project
router.delete('/deleteProject/:id', controller.deleteProject) //Delete a single project
router.post('/addUsers', controller.addUsers)
router.post('/deleteUser', controller.deleteUser)
router.post('/changePerm', controller.changePerm) //Change a users permission in a project

module.exports = router;