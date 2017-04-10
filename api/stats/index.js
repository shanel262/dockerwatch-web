var express = require('express');
var controller = require('./stats.controller');

var router = express.Router();

router.get('/getStat/:containerId', controller.getStat) //Get stats for specific container
router.get('/getInfo/:containerId', controller.getInfo) //Get info for specific container
router.get('/checkContainer/:containerId', controller.checkContainer) //Check if container id exists in influx

module.exports = router;