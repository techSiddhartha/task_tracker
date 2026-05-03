const Project = require("../models/Project");
const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");

const verifyProjectAccess = async (projectId, user) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  const isMember = project.members.some((memberId) => `${memberId}` === `${user._id}`);
  if (user.role !== "admin" && !isMember) {
    throw new ApiError(403, "You do not have access to this project.");
  }

  return project;
};

const getTasks = async (req, res) => {
  const query = req.user.role === "admin" ? {} : { assignedTo: req.user._id };

  const tasks = await Task.find(query)
    .populate("assignedTo", "name email role")
    .populate("projectId", "name description")
    .populate("createdBy", "name email role")
    .sort({ dueDate: 1, createdAt: -1 });

  const statusSummary = {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === "To Do").length,
    inProgress: tasks.filter((task) => task.status === "In Progress").length,
    done: tasks.filter((task) => task.status === "Done").length,
    overdue: tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done"
    ).length
  };

  res.json({ tasks, statusSummary });
};

const getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignedTo", "name email role")
    .populate("projectId", "name description members")
    .populate("createdBy", "name email role");

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  const hasAccess =
    req.user.role === "admin" ||
    `${task.assignedTo._id}` === `${req.user._id}` ||
    task.projectId.members.some((memberId) => `${memberId}` === `${req.user._id}`);

  if (!hasAccess) {
    throw new ApiError(403, "You do not have access to this task.");
  }

  res.json({ task });
};

const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo, projectId } = req.body;

  if (!title || !assignedTo || !projectId) {
    throw new ApiError(400, "Title, assigned user, and project are required.");
  }

  const project = await verifyProjectAccess(projectId, req.user);

  const isAssigneeMember = project.members.some((memberId) => `${memberId}` === `${assignedTo}`);
  if (!isAssigneeMember) {
    throw new ApiError(400, "Assigned user must be a member of the selected project.");
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    assignedTo,
    projectId,
    createdBy: req.user._id
  });

  const populatedTask = await Task.findById(task._id)
    .populate("assignedTo", "name email role")
    .populate("projectId", "name description");

  res.status(201).json({ message: "Task created successfully.", task: populatedTask });
};

const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id).populate("projectId", "members");

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  const isAdmin = req.user.role === "admin";
  const isAssignee = `${task.assignedTo}` === `${req.user._id}`;

  if (!isAdmin && !isAssignee) {
    throw new ApiError(403, "You do not have permission to update this task.");
  }

  if (!isAdmin) {
    const allowedMemberKeys = ["status"];
    const payloadKeys = Object.keys(req.body);
    const hasRestrictedField = payloadKeys.some((key) => !allowedMemberKeys.includes(key));

    if (hasRestrictedField) {
      throw new ApiError(403, "Members can only update task status.");
    }
  }

  const updates = ["title", "description", "status", "priority", "dueDate", "assignedTo", "projectId"];
  updates.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  if (req.body.projectId || req.body.assignedTo) {
    const project = await verifyProjectAccess(task.projectId, req.user);
    const isAssigneeMember = project.members.some((memberId) => `${memberId}` === `${task.assignedTo}`);
    if (!isAssigneeMember) {
      throw new ApiError(400, "Assigned user must be a member of the selected project.");
    }
  }

  await task.save();

  const populatedTask = await Task.findById(task._id)
    .populate("assignedTo", "name email role")
    .populate("projectId", "name description")
    .populate("createdBy", "name email role");

  res.json({ message: "Task updated successfully.", task: populatedTask });
};

const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  await task.deleteOne();

  res.json({ message: "Task deleted successfully." });
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
