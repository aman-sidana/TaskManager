const taskModel = require("../model/taskModel");
const transporter = require("../utils/transporter");
const userModel = require('../model/userModel')
const { uploadImage } = require("../utils/cloudinary")

const googleTTS = require('google-tts-api')


exports.addTask = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.body);

        const { taskName, status, assignedto, duedate, images } = req.body;

        if (!taskName) {
            return res.status(400).json({
                success: false,
                message: "Task name is required"
            });
        }

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user"
            });
        }


        let imageUrl = "";


        if (req.files) {
            const uploadData = await uploadImage(req.files);

            imageUrl = uploadData[0].url;
        }

        const theuser = await userModel.findById(assignedto);

        if (!theuser) {
            return res.status(404).json({
                success: false,
                message: "Assigned user not found"
            });
        }

        const data = {
            taskName,
            status,
            assignedto,
            duedate,
            assignedby: req.user._id,
            images: imageUrl
        };

        const result = await taskModel.create(data);

        await transporter.info(
            theuser.email,
            "Task Assigned",
            `
            <h2>Hello ${theuser.name}</h2>
            <p>You have been assigned a new task.</p>

            <p><strong>Task:</strong> ${taskName}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Due Date:</strong> ${duedate}</p>
              ${imageUrl
                ? `<img src="${imageUrl}" alt="Task Image" width="300" style="max-width:100%;height:auto;" />`
                : ""
            }
            `
        );

        return res.status(201).json({
            success: true,
            message: "Task added successfully",
            result
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.allTask = async (req, res) => {
    try {
        const { assignedto, assignedby } = req.user
        if (req.user.role === "admin") {

            const result = await taskModel.find().populate("assignedto").populate("assignedby")
            return res.status(200).json(result);

        } else {

            const result = await taskModel.find({
                $or: [
                    { assignedto: req.user._id },
                    { assignedby: req.user._id }
                ]
            }).populate("assignedto").populate("assignedby")

            return res.status(200).json(result);
        }

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Unable to fetch tasks"
        });
    }
};

exports.updatetask = async (req, res) => {
    try {

        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                message: "Task id is required"
            });
        }

        const result = await taskModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const theuser = await userModel.findById(result.assignedto);

        if (!theuser) {
            return res.status(404).json({
                message: "Assigned user not found"
            });
        }

        const mail = await transporter.info(
            theuser.email,
            "Task Updated",
            `
                <p>Your task has been updated.</p>

                <p><strong>Task:</strong> ${result.taskName}</p>
                <p><strong>Status:</strong> ${result.status}</p>
                <p><strong>Due Date:</strong> ${result.duedate}</p>
            `
        );

        console.log("Email Sent:", mail.messageId);

        return res.status(200).json({
            message: "Task updated successfully",
            result
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.softdeletetask = async (req, res) => {
    try {

        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                message: "Task id is required"
            });
        }

        const result = await taskModel.findByIdAndUpdate(
            id,
            { isactive: false },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            message: "Task deactivated successfully",
            result
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Task not found"
        });
    }
};

exports.restoretask = async (req, res) => {
    try {

        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                message: "Task id is required"
            });
        }

        const result = await taskModel.findByIdAndUpdate(
            id,
            { isactive: true },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                message: "Task not found"
            });
        }


        return res.status(200).json({
            message: "Task restored successfully",
            result
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Task not found"
        });
    }
};

exports.deletetask = async (req, res) => {
    try {

        const id = req.params.id;
        console.log(`>>>>>id`, id)

        if (!id) {
            return res.status(400).json({
                message: "Task id is required"
            });
        }

        const result = await taskModel.findByIdAndDelete({ _id: id });
        console.log(`first`)

        if (!result) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            message: "Task deleted successfully",
            result
        });

    } catch (error) {

        console.log(error);

        return res.status(400).json({
            message: "Delete failed"
        });
    }
};

exports.statusdone = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                message: "Task id is required"
            });
        }

        const { status } = req.body;

        const task = await taskModel.findById(id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }


        const currentUserId = req.user._id.toString();

        const isAssignedTo =
            task.assignedto?.toString() === currentUserId;

        const isAssignedBy =
            task.assignedby?.toString() === currentUserId;


        if (
            isAssignedTo &&
            !isAssignedBy &&
            task.status === "done"
        ) {
            return res.status(403).json({
                message:
                    "You cannot change status after marking task done"
            });
        }

        const updateData = {
            status
        };

        if (status === "done") {
            updateData.completedAt = new Date();
        } else {
            updateData.completedAt = null;
        }

        const result = await taskModel.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument: "after"
            }
        );

        return res.status(200).json({
            message: "Status Changed successfully",
            result
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "internal server error"
        });
    }
};

exports.tts = async (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).json({
            message: "Text is required"
        });
    }

    const url = googleTTS.getAudioUrl(text, {
        lang: "en",
        slow: false,
    });

    res.json({
        audioUrl: url
    });
};