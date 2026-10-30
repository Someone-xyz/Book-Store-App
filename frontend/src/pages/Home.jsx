import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api/client.js';
import BookCard from '../components/BookCard.jsx';
import { Empty, ErrorBox, Loading } from '../components/Feedback.jsx';

export default function Home() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const page = Number(params.get('page')) || 1;
  const [text, setText] = useState(search);
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get('/books/get/all/books', { params: { search, page, limit: 12 } })
      .then((r) => {
        if (cancelled) return;
        setBooks(r.data.data);
        setPagination(r.data.pagination);
      })
      .catch((e) => !cancelled && setError(errMsg(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [search, page]);

  const submit = (e) => {
    e.preventDefault();
    setParams(text.trim() ? { search: text.trim() } : {});
  };
  const goTo = (p) => setParams({ ...(search && { search }), page: p });

  return (
    <>
      <section className="hero">
        <h1>Read what independent authors are writing now</h1>
        <form onSubmit={submit} className="search" role="search">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by title" aria-label="Search books by title" />
          <button className="btn">Search</button>
        </form>
      </section>

      <ErrorBox>{error}</ErrorBox>
      {loading ? (
        <Loading label="Fetching books…" />
      ) : books.length === 0 ? (
        <Empty title={search ? `No books match “${search}”` : 'The shelf is empty'}>
          <p>{search ? 'Try a different title.' : 'Be the first to publish a book.'}</p>
        </Empty>
      ) : (
        <>
          <div className="grid">{books.map((b) => <BookCard key={b._id} book={b} />)}</div>
          {pagination.pages > 1 && (
            <div className="pager">
              <button className="btn btn-ghost" disabled={page <= 1} onClick={() => goTo(page - 1)}>Previous</button>
              <span>Page {page} of {pagination.pages}</span>
              <button className="btn btn-ghost" disabled={page >= pagination.pages} onClick={() => goTo(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </>
  );
}
