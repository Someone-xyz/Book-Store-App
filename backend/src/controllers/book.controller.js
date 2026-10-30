const mongoose = require('mongoose');
const Book = require('../models/book.model.js');
const Payment = require('../models/payment.model.js');
const { uploadFile } = require('../services/imageKit.service.js');
const ApiError = require('../utils/ApiError.js');

const PREVIEW_LENGTH = 200;
const AUTHOR_FIELDS = 'name avatar';

const assertObjectId = (id, label = 'id') => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, `Invalid ${label}`);
};

const parsePrice = (value) => {
  const price = value === undefined || value === '' ? 0 : Number(value);
  if (!Number.isFinite(price) || price < 0) throw new ApiError(400, 'Price must be a non-negative number');
  return Math.round(price * 100) / 100;
};

const canManage = (user, book) =>
  user.role === 'admin' || String(book.bookAuthor?._id || book.bookAuthor) === String(user._id);

const uploadBook = async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please upload a book image');

  const bookTitle = String(req.body.bookTitle || '').trim();
  const bookContent = String(req.body.bookContent || '').trim();
  if (!bookTitle || !bookContent) throw new ApiError(400, 'Book title and content are required');

  const image = await uploadFile(req.file.buffer, req.file.originalname, '/bookstore/books');
  const book = await Book.create({
    bookTitle,
    bookContent,
    bookPrice: parsePrice(req.body.bookPrice),
    bookAuthor: req.user._id, // taken from the verified token, never from the request body
    bookImage: image.url,
  });

  res.status(201).json({ success: true, message: 'Book uploaded successfully', data: book });
};

const allBooks = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
  const filter = {};
  const search = String(req.query.search || '').trim();
  if (search) filter.bookTitle = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  const [books, total] = await Promise.all([
    Book.find(filter)
      .select('-bookContent') // full content is only served by the single-book endpoint
      .populate('bookAuthor', AUTHOR_FIELDS)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Book.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'All books fetched successfully',
    data: books,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
};

const oneBook = async (req, res) => {
  assertObjectId(req.params.id, 'book id');
  const book = await Book.findById(req.params.id).populate('bookAuthor', AUTHOR_FIELDS);
  if (!book) throw new ApiError(404, 'Book not found');

  const data = book.toObject();
  let canRead = data.bookPrice === 0;
  if (!canRead && req.user) {
    canRead =
      canManage(req.user, book) ||
      !!(await Payment.exists({ userId: req.user._id, bookId: book._id, paymentStatus: 'completed' }));
  }
  if (!canRead) data.bookContent = data.bookContent.slice(0, PREVIEW_LENGTH);

  res.status(200).json({
    success: true,
    message: 'Book fetched successfully',
    data: { ...data, canRead, isPreview: !canRead },
  });
};

const specificUserBooks = async (req, res) => {
  assertObjectId(req.params.id, 'user id');
  const books = await Book.find({ bookAuthor: req.params.id })
    .select('-bookContent')
    .populate('bookAuthor', AUTHOR_FIELDS)
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: 'Books fetched successfully', data: books });
};

const updateBook = async (req, res) => {
  assertObjectId(req.params.id, 'book id');
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');
  if (!canManage(req.user, book)) throw new ApiError(403, 'You can only edit your own books');

  const { bookTitle, bookContent, bookPrice } = req.body;
  if (bookTitle !== undefined) book.bookTitle = String(bookTitle).trim();
  if (bookContent !== undefined) book.bookContent = String(bookContent).trim();
  if (bookPrice !== undefined) book.bookPrice = parsePrice(bookPrice);
  if (req.file) book.bookImage = (await uploadFile(req.file.buffer, req.file.originalname, '/bookstore/books')).url;

  await book.save();
  res.status(200).json({ success: true, message: 'Book updated successfully', data: book });
};

const deleteBook = async (req, res) => {
  assertObjectId(req.params.id, 'book id');
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');
  if (!canManage(req.user, book)) throw new ApiError(403, 'You can only delete your own books');

  await book.deleteOne();
  res.status(200).json({ success: true, message: 'Book deleted successfully' });
};

module.exports = { uploadBook, allBooks, oneBook, specificUserBooks, updateBook, deleteBook };
