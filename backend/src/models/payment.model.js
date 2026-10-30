const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    amount: { type: Number, required: true, min: 0 }, // major units, e.g. 12.5
    currency: { type: String, default: 'usd' },
    paymentMethod: { type: String, default: null }, // filled in once Stripe reports it
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String, required: true, unique: true }, // Stripe PaymentIntent id
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
