var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var IngredientsMapperSchema   = new Schema({
    name: String,
    mysqlId: Number
});

module.exports = mongoose.model('IngredientsMapper', IngredientsMapperSchema);