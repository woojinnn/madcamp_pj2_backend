var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

// DEFINE SCHEMA
const scheduleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    passwd: {
        type: String,
        default: ""
    },
    timeslots: {
        type: [Schema.Types.ObjectId],
        ref: 'Timeslot'
    },
    days: {
        type: [String]
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'Profile'
    }
}, { versionKey: false });

module.exports = mongoose.model('Schedule', scheduleSchema);