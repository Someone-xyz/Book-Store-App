import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox } from '../components/Feedback.jsx';

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setBusy(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (avatar) data.append('avatar', avatar);
      await signUp(data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel form" onSubmit={submit}>
      <h1>Create your account</h1>
      <ErrorBox>{error}</ErrorBox>
      <label>Name<input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label>Email<input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <small>At least 8 characters</small></label>
      <label>Profile photo (optional)<input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0] || null)} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      <p className="muted">Already have an account? <Link to="/signin">Sign in</Link></p>
    </form>
  );
}
