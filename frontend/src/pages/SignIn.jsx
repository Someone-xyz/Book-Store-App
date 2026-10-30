import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox } from '../components/Feedback.jsx';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(form.email, form.password);
      navigate(state?.from || '/', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel form" onSubmit={submit}>
      <h1>Sign in</h1>
      <ErrorBox>{error}</ErrorBox>
      <label>Email<input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <p className="muted">New here? <Link to="/signup">Create an account</Link></p>
    </form>
  );
}
