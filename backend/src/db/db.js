const mongoose = require('mongoose');
const env = require('../config/env.js');

const connectDB = async () => {
  const conn = await mongoose.connect(env.mongoUri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

module.exports = connectDB;
