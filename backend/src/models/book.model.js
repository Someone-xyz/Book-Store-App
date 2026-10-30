const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    bookTitle: { type: String, required: [true, 'Book title is required'], trim: true, maxlength: 150 },
    bookAuthor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Book author is required'],
      index: true,
    },
    bookContent: { type: String, required: [true, 'Book content is required'] },
    bookImage: { type: String, required: [true, 'Book image is required'] },
    bookPrice: { type: Number, min: [0, 'Price cannot be negative'], default: 0 },
  },
  { timestamps: true }
);

// One author cannot publish two books with the same title (but different authors can).
bookSchema.index({ bookAuthor: 1, bookTitle: 1 }, { unique: true });

module.exports = mongoose.model('Book', bookSchema); // collection stays "books"
