import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">DocSign</h1>
        <div className="flex gap-4">
          {user ? (
            <Link to="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50">Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Get Started</Link>
            </>
          )}
        </div>
      </nav>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">Sign Documents <span className="text-indigo-600">Digitally</span></h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">Upload, sign, and verify PDF documents securely. Share a verification link with anyone to prove document authenticity.</p>
        <div className="flex gap-4">
          <Link to="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-indigo-700">Start Signing Free</Link>
          <Link to="/verify/demo" className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg text-lg hover:bg-indigo-50">Verify a Document</Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl">
          {[
            { icon: '📄', title: 'Upload PDF', desc: 'Upload any PDF document securely' },
            { icon: '✍️', title: 'Sign Digitally', desc: 'Draw or type your signature' },
            { icon: '✅', title: 'Verify Instantly', desc: 'Share a link to verify authenticity' },
          ].map((f) => (
            <div key={f.title} className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;