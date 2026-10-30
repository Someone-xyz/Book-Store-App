const jwt = require('jsonwebtoken');
const env = require('../config/env.js');
const User = require('../models/user.model.js');
const ApiError = require('../utils/ApiError.js');

const getToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

const loadUser = async (req) => {
  const token = getToken(req);
  if (!token) return null;
  const payload = jwt.verify(token, env.jwtSecret); // throws if forged or expired
  return User.findById(payload.id);
};

// Rejects the request unless a valid token for an existing user is present.
const requireAuth = async (req, res, next) => {
  let user;
  try {
    user = await loadUser(req);
  } catch {
    throw new ApiError(401, 'Session expired or invalid. Please sign in again');
  }
  if (!user) throw new ApiError(401, 'Unauthorized');
  req.user = user;
  next();
};

// Attaches req.user when a valid token exists, otherwise continues anonymously.
const optionalAuth = async (req, res, next) => {
  try {
    req.user = (await loadUser(req)) || null;
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { requireAuth, optionalAuth };
