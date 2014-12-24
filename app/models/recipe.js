var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RecipeSchema   = new Schema({
	user_id: String,
	name: String,
	servings: Number,
	ingredients: String,
	directions: String,
	category: String,
	image0: String,
	image1: String,
	image2: String,
	image3: String,
	date: String,
	verified: Boolean,
	archive: Boolean
});

module.exports = mongoose.model('Recipe', RecipeSchema);