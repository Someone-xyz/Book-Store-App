// One-off helper: drops the old bad unique indexes (users.name, books.bookAuthor, books.bookContent)
// and creates the new ones. Run once with:  npm run db:sync-indexes
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user.model.js');
const Book = require('../src/models/book.model.js');
const Payment = require('../src/models/payment.model.js');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  for (const m of [User, Book, Payment]) {
    const dropped = await m.syncIndexes();
    console.log(m.modelName, 'dropped indexes:', dropped);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
