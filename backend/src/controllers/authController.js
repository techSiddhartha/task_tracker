const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");

const buildAuthResponse = (user) => ({
  token: generateToken(user._id),
  user: user.toSafeObject()
});

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === "admin" ? "admin" : "member"
  });

  res.status(201).json(buildAuthResponse(user));
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  res.json(buildAuthResponse(user));
};

const getCurrentUser = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

module.exports = {
  signup,
  login,
  getCurrentUser
};
