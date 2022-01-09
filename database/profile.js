// generate SCHEMA
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// DEFINE SCHEMA
const profileSchema = new Schema({
    userId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model('Profile', profileSchema);