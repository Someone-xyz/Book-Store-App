import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api/client.js';
import BookCard from '../components/BookCard.jsx';
import { Empty, ErrorBox, Loading } from '../components/Feedback.jsx';

export default function Library() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/payments/my-purchases').then((r) => setItems(r.data.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (!items && !error) return <Loading />;
  return (
    <>
      <h1>My library</h1>
      <ErrorBox>{error}</ErrorBox>
      {items?.length === 0 ? (
        <Empty title="No purchases yet">
          <p>Books you buy will appear here.</p>
          <Link to="/" className="btn">Browse books</Link>
        </Empty>
      ) : (
        <div className="grid">{items?.map((p) => <BookCard key={p._id} book={p.bookId} />)}</div>
      )}
    </>
  );
}
