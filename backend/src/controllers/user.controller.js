const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');
const { uploadFile } = require('../services/imageKit.service.js');
const env = require('../config/env.js');
const ApiError = require('../utils/ApiError.js');

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
};

const issueToken = (res, user) => {
  const token = jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, { expiresIn: '7d' });
  res.cookie('token', token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  createdAt: user.createdAt,
});

const signUp = async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || !password) throw new ApiError(400, 'Name, email and password are required');
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');
  if (await User.exists({ email })) throw new ApiError(409, 'An account with this email already exists');

  let avatar;
  if (req.file) {
    const uploaded = await uploadFile(req.file.buffer, req.file.originalname, '/bookstore/avatars');
    avatar = uploaded.url;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, ...(avatar && { avatar }) });

  issueToken(res, user);
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    userId: user._id,
    userData: publicUser(user),
  });
};

const signIn = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await User.findOne({ email }).select('+password');
  // Same message for unknown email and wrong password: avoids leaking which emails exist.
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new ApiError(401, 'Invalid email or password');

  issueToken(res, user);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    userId: user._id,
    userData: publicUser(user),
    role: user.role,
  });
};

const signOut = async (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// Lets the SPA restore the session on page load (the cookie is httpOnly, so JS cannot read it).
const me = async (req, res) => {
  res.status(200).json({ success: true, userData: publicUser(req.user) });
};

module.exports = { signUp, signIn, signOut, me };
