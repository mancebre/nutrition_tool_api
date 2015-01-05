var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ProfileSchema   = new Schema({
    user_id: {
        type: String,
        required: true,
        index: { unique : true }
    },
    name: {
        type: String,
        required: true,
        index: { unique : true }
    },
    image: String,
    date: String,
    update: String,
    webSite: String,
    country: String,
    state: String,
    city: String,
    address: String,
    zipCode: String,
    phoneNumber: String
});

module.exports = mongoose.model('company_profile', ProfileSchema);