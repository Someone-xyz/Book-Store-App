import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import BookDetail from './pages/BookDetail.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import BookForm from './pages/BookForm.jsx';
import MyBooks from './pages/MyBooks.jsx';
import Library from './pages/Library.jsx';
import Checkout from './pages/Checkout.jsx';
import PaymentResult from './pages/PaymentResult.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/publish" element={<BookForm />} />
            <Route path="/books/:id/edit" element={<BookForm />} />
            <Route path="/my-books" element={<MyBooks />} />
            <Route path="/library" element={<Library />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/payment/result" element={<PaymentResult />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
