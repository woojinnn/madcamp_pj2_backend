// generate SCHEMA
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// DEFINE SCHEMA
const bookSchema = new Schema({
    title: String,
    author: String,
    published_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema);