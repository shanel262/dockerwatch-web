var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var ProjectsSchema = new Schema({
	name: { type: String, required: true } ,
	owner: { type: String, required: true } ,
	containers: { type: String },
	time: { type: Date, default: Date.now}
});

module.exports = mongoose.model('projects', ProjectsSchema);