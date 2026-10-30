import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api/client.js';
import { ErrorBox, Loading } from '../components/Feedback.jsx';

// Used for both publishing (/publish) and editing (/books/:id/edit).
export default function BookForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ bookTitle: '', bookContent: '', bookPrice: '0' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;
    api.get(`/books/get/one/book/${id}`)
      .then((r) => {
        const b = r.data.data;
        setForm({ bookTitle: b.bookTitle, bookContent: b.bookContent, bookPrice: String(b.bookPrice) });
        setPreview(b.bookImage);
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const pickImage = (file) => {
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!editing && !image) return setError('Choose a cover image');
    setBusy(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('bookImage', image);
      const res = editing ? await api.put(`/books/update/book/${id}`, data) : await api.post('/books/upload/book', data);
      navigate(`/books/${res.data.data._id}`);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <form className="panel form form-wide" onSubmit={submit}>
      <h1>{editing ? 'Edit your book' : 'Publish a book'}</h1>
      <ErrorBox>{error}</ErrorBox>
      <label>Title<input required maxLength={150} value={form.bookTitle} onChange={(e) => setForm({ ...form, bookTitle: e.target.value })} /></label>
      <label>Price in USD<input type="number" min="0" step="0.01" required value={form.bookPrice} onChange={(e) => setForm({ ...form, bookPrice: e.target.value })} />
        <small>Enter 0 to give it away free. Paid books must cost at least $0.50.</small></label>
      <label>Book text<textarea required rows={10} value={form.bookContent} onChange={(e) => setForm({ ...form, bookContent: e.target.value })} /></label>
      <label>Cover image<input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files[0] || null)} /></label>
      {preview && <img src={preview} alt="Cover preview" className="cover-preview" />}
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Publish book'}</button>
    </form>
  );
}
