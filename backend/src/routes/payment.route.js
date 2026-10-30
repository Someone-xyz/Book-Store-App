const express = require('express');
const { createPaymentIntent, getPaymentStatus, myPurchases } = require('../controllers/payment.controller.js');
const { requireAuth } = require('../middlewares/auth.middleware.js');

const router = express.Router();

router.post('/create-payment-intent', requireAuth, createPaymentIntent);
router.get('/payment-status/:transactionId', requireAuth, getPaymentStatus);
router.get('/my-purchases', requireAuth, myPurchases);

module.exports = router;
