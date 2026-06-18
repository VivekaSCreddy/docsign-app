import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Sign from './pages/Sign';
import Verify from './pages/Verify';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify/:verificationId" element={<Verify />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/sign/:id" element={
          <PrivateRoute><Sign /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute><Admin /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;