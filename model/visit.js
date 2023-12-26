const mongoose = require('mongoose')

const visitSchema = new mongoose.Schema({
    visitor_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Visitor'
    },
    purposeOfVisit: {
        type: String,
        required: true
    },
    visitTime: {
        type: Date,
        default: Date.now
    }
    // Add more properties for the visit as needed
    // For example: checkInTime, checkOutTime, etc.
}, { timestamps: true });  // Add timestamps to track visit creation and update times

const Visit = mongoose.model('Visit', visitSchema);
module.exports = Visit