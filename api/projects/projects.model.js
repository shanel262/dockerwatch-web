var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var TeamSchema = new Schema({
	_id: { type: String, required: true },
	permission: { type: Boolean, required: true }
})

var ProjectsSchema = new Schema({
	name: { type: String, required: true } ,
	owner: { type: String, required: true } ,
	containers: { type: String },
	team: [TeamSchema],
	time: { type: Date, default: Date.now}
});

module.exports = mongoose.model('projects', ProjectsSchema);