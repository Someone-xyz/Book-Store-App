const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env.js');
const userRoutes = require('./routes/user.route.js');
const bookRoutes = require('./routes/book.route.js');
const paymentRoutes = require('./routes/payment.route.js');
const { handleWebhook } = require('./controllers/payment.controller.js');
const { notFound, errorHandler } = require('./middlewares/error.middleware.js');

const app = express();

if (env.isProd) app.set('trust proxy', 1); // needed for secure cookies behind a proxy (Render, Railway, Nginx...)

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.clientUrl.split(',').map((o) => o.trim()),
    credentials: true, // required so the browser sends/accepts the httpOnly auth cookie
  })
);

// Stripe needs the untouched raw body to verify signatures, so this route must come BEFORE express.json().
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/v1/health', (req, res) => res.json({ success: true, status: 'ok' }));

// Base: http://localhost:1010
app.use('/api/v1/users', userRoutes); //    POST /signup, POST /signin, POST /signout, GET /me
app.use('/api/v1/books', bookRoutes); //    POST /upload/book, GET /get/all/books, GET /get/one/book/:id,
//                                           GET /get/specific/user/books/:id, PUT /update/book/:id, DELETE /delete/book/:id
app.use('/api/v1/payments', paymentRoutes); // POST /create-payment-intent, GET /payment-status/:transactionId,
//                                             GET /my-purchases, POST /webhook (Stripe only)

app.use(notFound);
app.use(errorHandler);

module.exports = app;
