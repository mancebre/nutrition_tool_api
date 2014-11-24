var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RecipeSchema   = new Schema({
	user_id: String,
	name: String,
	servings: Number,
	ingredients: String,
	directions: String,
	category: String
});

module.exports = mongoose.model('Recipe', RecipeSchema);