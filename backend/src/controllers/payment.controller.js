const mongoose = require('mongoose');
const Stripe = require('stripe');
const Payment = require('../models/payment.model.js');
const Book = require('../models/book.model.js');
const env = require('../config/env.js');
const ApiError = require('../utils/ApiError.js');

const stripe = new Stripe(env.stripeSecretKey);
const STRIPE_MIN_AMOUNT = 50; // Stripe's minimum charge is 50 cents (or equivalent)

const statusFromIntent = (intent) => {
  if (intent.status === 'succeeded') return 'completed';
  if (intent.status === 'canceled') return 'failed';
  return null; // still in progress: keep the stored status
};

// Copies the real state from Stripe into our database (used by the webhook and as a fallback).
const applyIntent = async (payment, intent) => {
  const next = statusFromIntent(intent);
  if (next && payment.paymentStatus !== next) payment.paymentStatus = next;
  if (next === 'completed') payment.paymentMethod = intent.payment_method_types?.[0] || payment.paymentMethod;
  if (payment.isModified()) await payment.save();
  return payment;
};

const createPaymentIntent = async (req, res) => {
  const { bookId } = req.body;
  if (!mongoose.isValidObjectId(bookId)) throw new ApiError(400, 'A valid bookId is required');

  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, 'Book not found');
  if (String(book.bookAuthor) === String(req.user._id)) throw new ApiError(400, 'You already own this book');
  if (await Payment.exists({ userId: req.user._id, bookId, paymentStatus: 'completed' })) {
    throw new ApiError(409, 'You have already purchased this book');
  }

  // The price always comes from the database, never from the client.
  const amountMinor = Math.round(book.bookPrice * 100);
  if (amountMinor < STRIPE_MIN_AMOUNT) throw new ApiError(400, 'This book is free, no payment needed');

  const intent = await stripe.paymentIntents.create({
    amount: amountMinor,
    currency: env.currency,
    automatic_payment_methods: { enabled: true },
    metadata: { userId: String(req.user._id), bookId: String(book._id) },
  });

  await Payment.create({
    userId: req.user._id,
    bookId: book._id,
    amount: amountMinor / 100,
    currency: env.currency,
    transactionId: intent.id,
  });

  res.status(201).json({
    success: true,
    clientSecret: intent.client_secret,
    transactionId: intent.id,
    amount: amountMinor / 100,
    currency: env.currency,
  });
};

const getPaymentStatus = async (req, res) => {
  const payment = await Payment.findOne({
    transactionId: req.params.transactionId,
    userId: req.user._id, // users can only see their own payments
  }).populate('bookId', 'bookTitle bookImage');
  if (!payment) throw new ApiError(404, 'Payment not found');

  if (payment.paymentStatus !== 'completed') {
    const intent = await stripe.paymentIntents.retrieve(payment.transactionId);
    await applyIntent(payment, intent);
  }

  res.status(200).json({
    success: true,
    paymentStatus: payment.paymentStatus,
    amount: payment.amount,
    currency: payment.currency,
    book: payment.bookId,
  });
};

const myPurchases = async (req, res) => {
  const payments = await Payment.find({ userId: req.user._id, paymentStatus: 'completed' })
    .populate('bookId', 'bookTitle bookImage bookPrice')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: payments.filter((p) => p.bookId) });
};

// Mounted in app.js with express.raw() BEFORE express.json(): Stripe signs the raw bytes.
const handleWebhook = async (req, res) => {
  if (!env.stripeWebhookSecret) return res.status(503).json({ success: false, message: 'Webhook is not configured' });

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], env.stripeWebhookSecret);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook signature failed: ${err.message}` });
  }

  const intent = event.data.object;
  if (['payment_intent.succeeded', 'payment_intent.payment_failed', 'payment_intent.canceled'].includes(event.type)) {
    const payment = await Payment.findOne({ transactionId: intent.id });
    if (payment) {
      if (event.type === 'payment_intent.payment_failed') {
        if (payment.paymentStatus === 'pending') {
          payment.paymentStatus = 'failed';
          await payment.save();
        }
      } else {
        await applyIntent(payment, intent);
      }
    }
  }
  res.status(200).json({ received: true });
};

module.exports = { createPaymentIntent, getPaymentStatus, myPurchases, handleWebhook };
