var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

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

module.exports = mongoose.model('Timeslot', timeSlotSchema);