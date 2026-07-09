const express = require("express");
const router = express.Router();

const taskController = require("../controller/taskController");
const auth = require("../middleware/auth");

router.post("/addtask", auth, taskController.addTask);
router.get("/alltask", auth, taskController.allTask);
router.patch("/updatetask/:id", auth, taskController.updatetask);
router.patch("/softdeletetask/:id", auth, taskController.softdeletetask);
router.patch("/restoretask/:id", auth, taskController.restoretask);
router.delete("/deletetask/:id", auth, taskController.deletetask);
router.patch("/statusdone/:id", auth, taskController.statusdone);

router.post("/downloadpdf", auth, taskController.downloadPdf);

router.get("/tts", taskController.tts);

module.exports = router;