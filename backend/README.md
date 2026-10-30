# Inkwell backend

Express 5 + MongoDB + ImageKit + Stripe.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill it in (keep `PORT=1010`; the frontend expects it).
3. If you already have data from the old version, run `npm run db:sync-indexes` once. It removes the old unique indexes
   (users.name, books.bookAuthor, books.bookContent). Old books stored a plain-string author, so delete those test books.
4. `npm run dev`

## Stripe webhook (local)
`stripe listen --forward-to localhost:1010/api/v1/payments/webhook` and put the printed `whsec_...` in `STRIPE_WEBHOOK_SECRET`.
Without the webhook the app still works: the payment-status endpoint asks Stripe directly.

## Endpoints (base `/api/v1`)
| Method | Path | Auth |
|---|---|---|
| POST | /users/signup (multipart: name, email, password, avatar?) | no |
| POST | /users/signin | no |
| POST | /users/signout | no |
| GET | /users/me | yes |
| POST | /books/upload/book (multipart: bookTitle, bookContent, bookPrice, bookImage) | yes |
| GET | /books/get/all/books?search=&page=&limit= | no |
| GET | /books/get/one/book/:id | optional |
| GET | /books/get/specific/user/books/:id | yes |
| PUT | /books/update/book/:id | owner/admin |
| DELETE | /books/delete/book/:id | owner/admin |
| POST | /payments/create-payment-intent ({ bookId }) | yes |
| GET | /payments/payment-status/:transactionId | yes |
| GET | /payments/my-purchases | yes |
| POST | /payments/webhook | Stripe signature |
