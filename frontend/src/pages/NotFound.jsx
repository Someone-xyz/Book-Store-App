import { Link } from 'react-router-dom';
import { Empty } from '../components/Feedback.jsx';

export default function NotFound() {
  return (
    <Empty title="Page not found">
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn">Back to browse</Link>
    </Empty>
  );
}
