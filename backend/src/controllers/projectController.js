const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");

const ensureMembersExist = async (members = []) => {
  const users = await User.find({ _id: { $in: members } });
  if (users.length !== members.length) {
    throw new ApiError(400, "One or more selected members do not exist.");
  }
};

const getProjects = async (req, res) => {
  const query = req.user.role === "admin" ? {} : { members: req.user._id };

  const projects = await Project.find(query)
    .populate("members", "name email role")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  res.json({ projects });
};

const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("members", "name email role")
    .populate("createdBy", "name email role");

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  if (req.user.role !== "admin" && !project.members.some((member) => `${member._id}` === `${req.user._id}`)) {
    throw new ApiError(403, "You do not have access to this project.");
  }

  res.json({ project });
};

const createProject = async (req, res) => {
  const { name, description, members = [] } = req.body;

  if (!name) {
    throw new ApiError(400, "Project name is required.");
  }

  const uniqueMembers = [...new Set([`${req.user._id}`, ...members.map(String)])];
  await ensureMembersExist(uniqueMembers);

  const project = await Project.create({
    name,
    description,
    members: uniqueMembers,
    createdBy: req.user._id
  });

  const populatedProject = await project.populate("members", "name email role");

  res.status(201).json({ message: "Project created successfully.", project: populatedProject });
};

const updateProject = async (req, res) => {
  const { name, description, members } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  if (Array.isArray(members)) {
    const uniqueMembers = [...new Set([`${req.user._id}`, ...members.map(String)])];
    await ensureMembersExist(uniqueMembers);
    project.members = uniqueMembers;
  }

  if (name !== undefined) {
    project.name = name;
  }

  if (description !== undefined) {
    project.description = description;
  }

  await project.save();
  await project.populate("members", "name email role");

  res.json({ message: "Project updated successfully.", project });
};

const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  await Task.deleteMany({ projectId: project._id });
  await project.deleteOne();

  res.json({ message: "Project and related tasks deleted successfully." });
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
