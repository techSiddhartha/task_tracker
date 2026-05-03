const express = require("express");

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.route("/").get(getProjects).post(authorize("admin"), createProject);
router.route("/:id").get(getProjectById).put(authorize("admin"), updateProject).delete(authorize("admin"), deleteProject);

module.exports = router;
