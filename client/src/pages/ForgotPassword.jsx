import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/auth/forgot-password', { email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successful');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                step > s ? 'bg-green-500 text-white' :
                step === s ? 'bg-indigo-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-8 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">Reset Password</h2>

        {/* Step 1 - Email */}
        {step === 1 && (
          <>
            <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a 6-digit OTP.</p>
            <form onSubmit={sendOTP} className="space-y-4">
              <input type="email" placeholder="Enter your email" required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={email} onChange={e => setEmail(e.target.value)} />
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {/* Step 2 - OTP + New Password */}
        {step === 2 && (
          <>
            <p className="text-gray-500 text-sm mb-6">
              OTP sent to <span className="font-medium text-gray-700">{email}</span>. Check your inbox.
            </p>
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">6-digit OTP</label>
                <input type="text" placeholder="Enter OTP" required maxLength={6}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest text-center text-lg font-mono"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">New password</label>
                <input type="password" placeholder="Min 6 characters" required minLength={6}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button type="button" onClick={() => setStep(1)}
                className="w-full text-sm text-gray-500 hover:text-gray-700">
                ← Use a different email
              </button>
            </form>
          </>
        )}

        {/* Step 3 - Success */}
        {step === 3 && (
          <div className="text-center mt-6">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-gray-800 font-semibold text-lg mb-1">Password reset!</p>
            <p className="text-gray-500 text-sm mb-6">You can now log in with your new password.</p>
            <Link to="/login"
              className="block w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 text-center">
              Go to Login
            </Link>
          </div>
        )}

        {step !== 3 && (
          <p className="text-center text-gray-500 mt-6 text-sm">
            <Link to="/login" className="text-indigo-600 hover:underline">Back to Login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;