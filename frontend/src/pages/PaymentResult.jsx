import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api/client.js';
import { ErrorBox, Loading } from '../components/Feedback.jsx';

export default function PaymentResult() {
  const [params] = useSearchParams();
  const transactionId = params.get('payment_intent');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const tries = useRef(0);

  useEffect(() => {
    if (!transactionId) return;
    let timer;
    const poll = async () => {
      try {
        const { data } = await api.get(`/payments/payment-status/${transactionId}`);
        setResult(data);
        // Card payments settle fast; keep checking briefly if the status is still pending.
        if (data.paymentStatus === 'pending' && ++tries.current < 10) timer = setTimeout(poll, 1500);
      } catch (e) {
        setError(errMsg(e));
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [transactionId]);

  if (!transactionId) return <ErrorBox>No payment found in this link.</ErrorBox>;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!result) return <Loading label="Confirming your payment…" />;

  const { paymentStatus, book } = result;
  return (
    <div className="panel state-panel">
      {paymentStatus === 'completed' && (
        <>
          <h1>Payment received</h1>
          <p>{book?.bookTitle ? `“${book.bookTitle}” is now in your library.` : 'Your book is now in your library.'}</p>
          <div className="row">
            {book?._id && <Link className="btn" to={`/books/${book._id}`}>Start reading</Link>}
            <Link className="btn btn-ghost" to="/library">Go to my library</Link>
          </div>
        </>
      )}
      {paymentStatus === 'pending' && (
        <>
          <h1>Still processing</h1>
          <p>Your bank hasn’t confirmed the payment yet. Check your library in a minute.</p>
          <Link className="btn btn-ghost" to="/library">Go to my library</Link>
        </>
      )}
      {paymentStatus === 'failed' && (
        <>
          <h1>Payment failed</h1>
          <p>You were not charged. Try again with another card.</p>
          {book?._id && <Link className="btn" to={`/checkout/${book._id}`}>Try again</Link>}
        </>
      )}
    </div>
  );
}
