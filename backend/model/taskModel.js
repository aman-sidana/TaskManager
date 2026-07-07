const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    taskName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending"
    }
    ,
    isactive: {
        type: Boolean,
        default: true
    },
    duedate: {
        type: Date,
        required: true
    }, completedAt: {
        type: Date,
        default: null
    },
    assignedto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "useroftask"
    },
    assignedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "useroftask"
    },
    images:{
        type:String,
        default:""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("tasks", taskSchema);