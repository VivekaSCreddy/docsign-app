import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/api/auth/login', form);
      login(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h2>
        <p className="text-gray-500 mb-6">Sign in to your DocSign account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <div className="text-right">
            <Link to="/forgot-password" className="text-indigo-600 text-sm hover:underline">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6">Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;