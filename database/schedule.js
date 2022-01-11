var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

// DEFINE SCHEMA
const scheduleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    days: {
        type: [String],
        required: true
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    },
    passwd: {
        type: String,
        default: ""
    },
    timeslots: {
        type: [Schema.Types.ObjectId],
        ref: 'Timeslot'
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'Profile'
    }
}, { versionKey: false });

module.exports = mongoose.model('Schedule', scheduleSchema);