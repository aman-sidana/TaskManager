const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'useroftask',
        required:true
    },
    hostname:String,
    platform:String,
    arch:String,
    ostype:String
},{
    timestamps:true
})

module.exports = mongoose.model('userdevice', deviceSchema)



