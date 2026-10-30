const multer = require('multer');
const ApiError = require('../utils/ApiError.js');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
    cb(new ApiError(400, 'Only JPEG, PNG, WEBP or GIF images are allowed'));
  },
});

module.exports = { uploadImage: (field) => upload.single(field) };
