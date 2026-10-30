import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import api, { errMsg, money } from '../api/client.js';
import { ErrorBox, Loading } from '../components/Feedback.jsx';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) : null;

function PayForm({ amount, currency }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/payment/result` },
    });
    // Only reached on immediate errors (card declined, validation). Success redirects away.
    if (stripeError) setError(stripeError.message);
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="form">
      <PaymentElement />
      <ErrorBox>{error}</ErrorBox>
      <button className="btn" disabled={!stripe || busy}>{busy ? 'Processing…' : `Pay ${money(amount, currency)}`}</button>
    </form>
  );
}

export default function Checkout() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [intent, setIntent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, p] = await Promise.all([
          api.get(`/books/get/one/book/${id}`),
          api.post('/payments/create-payment-intent', { bookId: id }),
        ]);
        if (cancelled) return;
        setBook(b.data.data);
        setIntent(p.data);
      } catch (e) {
        if (!cancelled) setError(errMsg(e));
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (!stripePromise) return <ErrorBox>Add VITE_STRIPE_PUBLISHABLE_KEY to frontend/.env and restart the dev server.</ErrorBox>;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!intent || !book) return <Loading label="Preparing secure checkout…" />;

  return (
    <div className="panel checkout">
      <h1>Checkout</h1>
      <div className="summary">
        <img src={book.bookImage} alt="" />
        <div>
          <strong>{book.bookTitle}</strong>
          <p className="muted">by {book.bookAuthor?.name}</p>
        </div>
        <strong>{money(intent.amount, intent.currency)}</strong>
      </div>
      <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#0f766e' } } }}>
        <PayForm amount={intent.amount} currency={intent.currency} />
      </Elements>
    </div>
  );
}
