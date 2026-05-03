const express = require("express");

const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require("../controllers/taskController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.route("/").get(getTasks).post(authorize("admin"), createTask);
router.route("/:id").get(getTaskById).put(updateTask).delete(authorize("admin"), deleteTask);

module.exports = router;
