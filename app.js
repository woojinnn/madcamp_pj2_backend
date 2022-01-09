// [LOAD PACKAGES]
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// CONFIGURE: BODYPARSER
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CONFIGURE: SERVER PORT
const port = process.env.port || 80;

// CONFIGURE: MONGOOSE

// CONECT TO MONGODB SERVER
const connect_db = () => {
    if (process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true);
    }

    const mongodb_uri = 'mongodb://localhost/week2_0';
    mongoose.connect(mongodb_uri)
        .then(() => console.log("Succeed to connect MongoDB"))
        .catch(error => console.log('Failed to connect MongoDB', error));
}
const db = mongoose.connection;
db.on('error', (error) => {
    console.error('Error while connecting MongoDB', error);
});
db.on('disconnected', () => {
    console.error('Disconnected from MongoDB. Reconnect');
    connect_db();
});
connect_db();

// DEFINE MODEL
const Book = require('./database/book');
const Profile = require('./database/profile');
const Timeslot = require('./database/timeslot');
const Schedule = require('./database/schedule');

// CONFIGURE: ROUTER
const router_book = require("./routes/book_api")(app, Book);
const router_profile = require("./routes/profile_api")(app, Profile);
const router_schedule = require("./routes/schedule_api")(app, Schedule, Timeslot);

// RUN SERVER
const server = app.listen(port, function () {
    console.log("Express server has started on port " + port);
});