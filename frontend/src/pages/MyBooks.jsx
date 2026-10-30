import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import BookCard from '../components/BookCard.jsx';
import { Empty, ErrorBox, Loading } from '../components/Feedback.jsx';

export default function MyBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/books/get/specific/user/books/${user._id}`).then((r) => setBooks(r.data.data)).catch((e) => setError(errMsg(e)));
  }, [user._id]);

  const remove = async (book) => {
    if (!window.confirm(`Delete “${book.bookTitle}”? This cannot be undone.`)) return;
    try {
      await api.delete(`/books/delete/book/${book._id}`);
      setBooks((list) => list.filter((b) => b._id !== book._id));
    } catch (e) {
      setError(errMsg(e));
    }
  };

  if (!books && !error) return <Loading />;
  return (
    <>
      <h1>My books</h1>
      <ErrorBox>{error}</ErrorBox>
      {books?.length === 0 ? (
        <Empty title="You haven’t published anything yet">
          <Link to="/publish" className="btn">Publish your first book</Link>
        </Empty>
      ) : (
        <div className="grid">
          {books?.map((b) => (
            <BookCard key={b._id} book={b}>
              <div className="row">
                <Link to={`/books/${b._id}/edit`} className="btn btn-small btn-ghost">Edit</Link>
                <button className="btn btn-small btn-danger" onClick={() => remove(b)}>Delete</button>
              </div>
            </BookCard>
          ))}
        </div>
      )}
    </>
  );
}
