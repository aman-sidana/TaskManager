const taskModel = require("../model/taskModel");

exports.addTask = async (req, res) => {
    try {
        console.log("Incoming Body:", req.body);
        const { taskName, status, assignedto, duedate } = req.body;
        const data = { taskName, status, assignedto, duedate, assignedby: req.user._id }

        if (!taskName) {
            return res.status(400).json({
                message: "Task name is required"
            });
        }

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized user details"
            });
        }

        const creator_id = req.user._id;
        console.log(">>> Created By User ID:", creator_id);


        const result = await taskModel.create(data);

        console.log(">>> Saved Result:", result);

        return res.status(201).json({
            message: "Task added successfully",
            result
        });

    } catch (error) {
        console.error("Error inside addTask backend:", error);

        return res.status(500).json({
            message: "Internal server error"
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

        return res.status(200).json({
            message: "Task updated successfully",
            result
        });

    } catch (error) {

        console.log(error);

        return res.status(400).json({
            message: "No data found"
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
  