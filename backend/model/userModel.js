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
    role:{
        type:String,
        default :"user"
        
    },
    theme:{
        type:String,
        default:"light"
    }
})

module.exports = mongoose.model('useroftask', authSchema)



