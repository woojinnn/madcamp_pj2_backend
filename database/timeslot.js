var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

// DEFINE SCHEMA
const timeSlotSchema = new Schema({
    start: {
        type: Date,
        required: true
    },
    members: {  // available times
        type: [Schema.Types.ObjectId],
        ref: 'Profile',
        required: true
    }
}, { versionKey: false });

module.exports = mongoose.model('Timeslot', timeSlotSchema);