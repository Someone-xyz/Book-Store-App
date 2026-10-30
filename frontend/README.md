# Inkwell frontend

React 19 + Vite + React Router + Stripe Elements.

1. `npm install`
2. Copy `.env.example` to `.env`; set `VITE_STRIPE_PUBLISHABLE_KEY` (pk_test_...) and `VITE_API_URL` if your API is not on port 1010.
3. `npm run dev` then open http://localhost:5173

The backend's `CLIENT_URL` must be `http://localhost:5173` (default) so the sign-in cookie works.
