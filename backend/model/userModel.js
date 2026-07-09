const mongoose = require('mongoose')

const authSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    firebaseUid: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: "user"

    },
    theme: {
        type: String,
        default: "light"
    },
    otp: {
        type: Number,
    },
    expireTime: {
        type: Number
    }
    
})

module.exports = mongoose.model('useroftask', authSchema)



