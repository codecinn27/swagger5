const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true,
        min: 5
    },
    email:{
        type: String,
        required: true
    },
    phoneNumber:{
        type: Number,
        required: true
    },
    category:{
        type: String,
        enum: ['host','admin']
    },
    visitors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor'
    }],  // Embed an array of visitors within each host
    login_status:{
        type: Boolean
    }
    },
    {versionKey: false}
);


const User = mongoose.model('User', userSchema);
module.exports = User;