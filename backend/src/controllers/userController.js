const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");

const getUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users: users.map((user) => user.toSafeObject()) });
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.json({ user: user.toSafeObject() });
};

const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!["admin", "member"].includes(role)) {
    throw new ApiError(400, "Role must be admin or member.");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.role = role;
  await user.save();

  res.json({ message: "User role updated.", user: user.toSafeObject() });
};

const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  await Project.updateMany({ members: user._id }, { $pull: { members: user._id } });
  await Task.deleteMany({ assignedTo: user._id });
  await user.deleteOne();

  res.json({ message: "User deleted successfully." });
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser
};
