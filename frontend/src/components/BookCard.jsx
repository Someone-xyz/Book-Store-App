import { Link } from 'react-router-dom';
import { money } from '../api/client.js';

export default function BookCard({ book, children }) {
  return (
    <article className="book">
      <Link to={`/books/${book._id}`} className="book-cover">
        <img src={book.bookImage} alt={`Cover of ${book.bookTitle}`} loading="lazy" />
        <span className={`price ${book.bookPrice === 0 ? 'price-free' : ''}`}>{money(book.bookPrice)}</span>
      </Link>
      <h3 className="book-title"><Link to={`/books/${book._id}`}>{book.bookTitle}</Link></h3>
      {book.bookAuthor?.name && <p className="book-author">by {book.bookAuthor.name}</p>}
      {children}
    </article>
  );
}
