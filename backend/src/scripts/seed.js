const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../config/db");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([User.deleteMany(), Project.deleteMany(), Task.deleteMany()]);

    const [admin, memberOne, memberTwo] = await User.create([
      {
        name: "Ava Admin",
        email: "admin@example.com",
        password: "password123",
        role: "admin"
      },
      {
        name: "Mason Member",
        email: "member1@example.com",
        password: "password123",
        role: "member"
      },
      {
        name: "Sophia Member",
        email: "member2@example.com",
        password: "password123",
        role: "member"
      }
    ]);

    const project = await Project.create({
      name: "Website Redesign",
      description: "Revamp the customer-facing marketing website.",
      members: [admin._id, memberOne._id, memberTwo._id],
      createdBy: admin._id
    });

    await Task.create([
      {
        title: "Create hero section",
        description: "Design and implement the new landing page hero.",
        status: "In Progress",
        priority: "High",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        assignedTo: memberOne._id,
        projectId: project._id,
        createdBy: admin._id
      },
      {
        title: "Update analytics dashboard",
        description: "Track CTA clicks and page depth on the new flow.",
        status: "To Do",
        priority: "Medium",
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        assignedTo: memberTwo._id,
        projectId: project._id,
        createdBy: admin._id
      }
    ]);

    console.log("Seed data created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
