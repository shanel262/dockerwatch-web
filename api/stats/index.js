var express = require('express');
var controller = require('./stats.controller');

var router = express.Router();

router.get('/getStat/:containerId', controller.getStat) //Get stats for specific container

module.exports = router;