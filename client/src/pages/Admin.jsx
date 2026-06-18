import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ACTION_COLORS = {
  UPLOAD:   'bg-blue-100 text-blue-700',
  SIGN:     'bg-green-100 text-green-700',
  DOWNLOAD: 'bg-purple-100 text-purple-700',
  VERIFY:   'bg-indigo-100 text-indigo-700',
  LOGIN:    'bg-gray-100 text-gray-700',
  REGISTER: 'bg-yellow-100 text-yellow-700',
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied');
      navigate('/dashboard');
    }
  }, [user]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [u, d, l] = await Promise.all([
          API.get('/api/admin/users'),
          API.get('/api/admin/documents'),
          API.get('/api/admin/logs'),
        ]);
        setUsers(u.data);
        setDocuments(d.data);
        setLogs(l.data);
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleViewDoc = (doc) => {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(doc.signedUrl || doc.originalUrl)}&embedded=true`;
    window.open(viewerUrl, '_blank');
  };

  const signedDocs = documents.filter(d => d.status === 'signed').length;
  const pendingDocs = documents.filter(d => d.status === 'pending').length;

  const TABS = ['users', 'documents', 'logs'];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold text-indigo-600">DocSign</Link>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{user?.name}</span>
          <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline">Dashboard</Link>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total users" value={users.length} icon="👥" />
          <StatCard label="Total documents" value={documents.length} icon="📄" />
          <StatCard label="Signed" value={signedDocs} icon="✅" />
          <StatCard label="Pending" value={pendingDocs} icon="⏳" />
        </div>

        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm capitalize font-medium transition-colors ${
                tab === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}>
              {t === 'users' ? `Users (${users.length})` : t === 'documents' ? `Documents (${documents.length})` : `Audit logs (${logs.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-16">Loading...</p>
        ) : (
          <>
            {tab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-5 py-3 font-medium text-gray-600">Name</th>
                      <th className="px-5 py-3 font-medium text-gray-600">Email</th>
                      <th className="px-5 py-3 font-medium text-gray-600">Role</th>
                      <th className="px-5 py-3 font-medium text-gray-600">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={4} className="text-center text-gray-400 py-10">No users found</td></tr>
                    ) : users.map(u => (
                      <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-800">{u.name}</td>
                        <td className="px-5 py-3 text-gray-600">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            u.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'documents' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-5 py-3 font-medium text-gray-600">Document</th>
                      <th className="px-5 py-3 font-medium text-gray-600">Owner</th>
                      <th className="px-5 py-3 font-medium text-gray-600">Status</th>
                      <th className="px-5 py-3 font-medium text-gray-600">Uploaded</th>
                      <th className="px-5 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-400 py-10">No documents found</td></tr>
                    ) : documents.map(doc => (
                      <tr key={doc._id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-800 max-w-[200px] truncate">{doc.originalName}</td>
                        <td className="px-5 py-3 text-gray-600">
                          <div>{doc.userId?.name || '—'}</div>
                          <div className="text-xs text-gray-400">{doc.userId?.email}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            doc.status === 'signed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{doc.status}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleViewDoc(doc)}
                              className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100">
                              View
                            </button>
                            {doc.verificationId && (
                              <a href={`/verify/${doc.verificationId}`} target="_blank"
                                className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100">
                                Verify
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'logs' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-5 py-3 font-medium text-gray-600">Action</th>
                      <th className="px-5 py-3 font-medium text-gray-600">User</th>
                      <th className="px-5 py-3 font-medium text-gray-600">Document</th>
                      <th className="px-5 py-3 font-medium text-gray-600">IP</th>
                      <th className="px-5 py-3 font-medium text-gray-600">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-400 py-10">No logs found</td></tr>
                    ) : logs.map(log => (
                      <tr key={log._id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {log.userId ? (
                            <>
                              <div className="font-medium text-gray-800">{log.userId.name}</div>
                              <div className="text-xs text-gray-400">{log.userId.email}</div>
                            </>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-5 py-3 text-gray-500 max-w-[160px] truncate">
                          {log.documentId?.originalName || '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-400 font-mono text-xs">{log.ipAddress || '—'}</td>
                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;