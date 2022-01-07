var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// DEFINE SCHEMA
const timeSlotSchema = new Schema({
    start: {
        type: Date,
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    }]
});

const scheduleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    passwd: {
        type: String,
        default: ""
    },
    timeslots: [timeSlotSchema],
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'Profile'
    }]
});

module.exports = mongoose.model('Schedule', scheduleSchema);