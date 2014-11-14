var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AccountSchema   = new Schema({
	email: String,
	user: String,
	pass: String,
	role: String,
	date: String,
});

module.exports = mongoose.model('Account', AccountSchema);