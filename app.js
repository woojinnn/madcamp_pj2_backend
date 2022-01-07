// [LOAD PACKAGES]
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// CONFIGURE: BODYPARSER
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CONFIGURE: SERVER PORT
var port = process.env.port || 80;

// CONFIGURE: MONGOOSE

// CONECT TO MONGODB SERVER
const connect_db = () => {
    if (process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true);
    }

    var mongodb_uri = 'mongodb://localhost/mongodb_tutorial';
    mongoose.connect(mongodb_uri)
        .then(() => console.log("Succeed to connect MongoDB"))
        .catch(error => console.log('Failed to connect MongoDB', error));
}
var db = mongoose.connection;
db.on('error', (error) => {
    console.error('Error while connecting MongoDB', error);
});
db.on('disconnected', () => {
    console.error('Disconnected from MongoDB. Reconnect');
    connect_db();
});
connect_db();

// DEFINE MODEL
var Book = require('./database/book');
var Profile = require('./database/profile');
var Schedule = require('./database/schedule');

// CONFIGURE: ROUTER
var router = require("./routes/book_api")(app, Book);
var router = require("./routes/profile_api")(app, Profile);

// RUN SERVER
var server = app.listen(port, function () {
    console.log("Express server has started on port " + port);
});