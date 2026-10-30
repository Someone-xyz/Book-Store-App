const express = require('express');
const ctrl = require('../controllers/book.controller.js');
const { requireAuth, optionalAuth } = require('../middlewares/auth.middleware.js');
const { uploadImage } = require('../middlewares/upload.middleware.js');

const router = express.Router();

router.post('/upload/book', requireAuth, uploadImage('bookImage'), ctrl.uploadBook);
router.get('/get/all/books', ctrl.allBooks);
router.get('/get/one/book/:id', optionalAuth, ctrl.oneBook);
router.get('/get/specific/user/books/:id', requireAuth, ctrl.specificUserBooks);
router.put('/update/book/:id', requireAuth, uploadImage('bookImage'), ctrl.updateBook);
router.delete('/delete/book/:id', requireAuth, ctrl.deleteBook);

module.exports = router;
