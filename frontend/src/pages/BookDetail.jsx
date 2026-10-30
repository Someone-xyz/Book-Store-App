import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg, money } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox, Loading } from '../components/Feedback.jsx';

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setBook(null);
    api.get(`/books/get/one/book/${id}`).then((r) => setBook(r.data.data)).catch((e) => setError(errMsg(e)));
  }, [id, user?._id]); // refetch after sign-in so purchased content unlocks

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!book) return <Loading />;

  const isOwner = user && user._id === book.bookAuthor?._id;
  const buy = () => (user ? navigate(`/checkout/${book._id}`) : navigate('/signin', { state: { from: `/books/${book._id}` } }));

  return (
    <article className="detail">
      <img className="detail-cover" src={book.bookImage} alt={`Cover of ${book.bookTitle}`} />
      <div>
        <h1>{book.bookTitle}</h1>
        <p className="byline">
          <img src={book.bookAuthor?.avatar} alt="" className="avatar" /> {book.bookAuthor?.name}
        </p>
        <p className="detail-price">{money(book.bookPrice)}</p>

        {isOwner ? (
          <Link to={`/books/${book._id}/edit`} className="btn btn-ghost">Edit your book</Link>
        ) : !book.canRead ? (
          <button className="btn" onClick={buy}>Buy for {money(book.bookPrice)}</button>
        ) : null}

        <div className="reading">
          <p className="reading-text">{book.bookContent}{book.isPreview && '…'}</p>
          {book.isPreview && <p className="locked">This is a preview. Buy the book to read the rest.</p>}
        </div>
      </div>
    </article>
  );
}
