import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">Inkwell</Link>
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Browse</NavLink>
          {user && (
            <>
              <NavLink to="/library">My library</NavLink>
              <NavLink to="/my-books">My books</NavLink>
              <NavLink to="/publish" className="btn btn-small">Publish a book</NavLink>
            </>
          )}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <img src={user.avatar} alt="" className="avatar" />
              <span className="nav-name">{user.name}</span>
              <button className="link-btn" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/signin">Sign in</Link>
              <Link to="/signup" className="btn btn-small">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
