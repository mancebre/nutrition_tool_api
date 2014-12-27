var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CategorySchema   = new Schema({
    user_id: String,
    name: String,
    date: String
});

module.exports = mongoose.model('MenuCategory', CategorySchema);