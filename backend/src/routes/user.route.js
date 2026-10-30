const express = require('express');
const rateLimit = require('express-rate-limit');
const { signUp, signIn, signOut, me } = require('../controllers/user.controller.js');
const { requireAuth } = require('../middlewares/auth.middleware.js');
const { uploadImage } = require('../middlewares/upload.middleware.js');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again in a few minutes' },
});

router.post('/signup', authLimiter, uploadImage('avatar'), signUp);
router.post('/signin', authLimiter, signIn);
router.post('/signout', signOut);
router.get('/me', requireAuth, me);

module.exports = router;
