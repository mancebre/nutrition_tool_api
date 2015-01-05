var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AccountSchema   = new Schema({
	email:  {
		type: String,
		required: true,
		index: { unique : true }
	},
	user: String,
	pass: String,
	full_name: String,
	role: String,
	company_role: String,
	updated: String,
	phone: String,
	image: String,
	date: String
});

module.exports = mongoose.model('Account', AccountSchema);