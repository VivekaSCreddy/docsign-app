import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all');
  const fileRef = useRef();
  const navigate = useNavigate();

  const fetchDocs = async () => {
    try {
      const { data } = await API.get('/api/documents');
      setDocs(data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const { data } = await API.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded!');
      setDocs(prev => [data, ...prev]);
      navigate(`/sign/${data._id}`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const { data } = await API.post(`/api/documents/download/${doc._id}`);
      window.open(data.url, '_blank');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleView = async (doc) => {
    try {
      const { data } = await API.post(`/api/documents/download/${doc._id}`);
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(data.url)}&embedded=true`;
      window.open(viewerUrl, '_blank');
    } catch {
      toast.error('Failed to open document');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filtered = filter === 'all' ? docs : docs.filter(d => d.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600">DocSign</Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Hi, {user?.name}</span>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">Admin</Link>
          )}
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Documents</h2>
          <button onClick={() => fileRef.current.click()} disabled={uploading}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {uploading ? 'Uploading...' : '+ Upload PDF'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'signed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-16">Loading documents...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📄</p>
            <p className="text-gray-500">No documents yet. Upload a PDF to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(doc => (
              <div key={doc._id} className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{doc.originalName}</p>
                  <p className="text-sm text-gray-400 mt-1">{new Date(doc.createdAt).toLocaleDateString()}</p>
                  {doc.verificationId && (
                    <a href={`/verify/${doc.verificationId}`} target="_blank"
                      className="text-xs text-indigo-500 hover:underline mt-1 block">
                      View verification link
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${doc.status === 'signed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {doc.status}
                  </span>
                  {doc.status === 'pending' && (
                    <button onClick={() => navigate(`/sign/${doc._id}`)}
                      className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                      Sign
                    </button>
                  )}
                  {doc.status === 'signed' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleView(doc)}
                        className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                        View
                      </button>
                      <button onClick={() => handleDownload(doc)}
                        className="text-sm bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100">
                        Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;