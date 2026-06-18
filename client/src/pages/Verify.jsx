import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';

const Verify = () => {
  const { verificationId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await API.get(`/api/verify/${verificationId}`);
        setResult(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Document not found');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [verificationId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Document Verification</h1>
        </div>
        {loading && <p className="text-gray-500 text-center py-8">Verifying document...</p>}
        {error && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-red-600 font-semibold text-lg">{error}</p>
            <p className="text-gray-500 mt-2">This document could not be verified</p>
          </div>
        )}
        {result && (
          <div>
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-4xl">✅</div>
              <div>
                <p className="font-semibold text-green-800">Document is Valid</p>
                <p className="text-green-600 text-sm">Signed and verified on DocSign platform</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Document Name', value: result.documentName },
                { label: 'Signed By', value: result.signedBy },
                { label: 'Signer Email', value: result.signerEmail },
                { label: 'Signed At', value: new Date(result.signedAt).toLocaleString() },
                { label: 'Status', value: result.status.toUpperCase() },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-gray-800">{item.value}</span>
                </div>
              ))}
              <div className="py-2 border-b">
                <p className="text-gray-500 mb-1">Document Hash (SHA-256)</p>
                <p className="font-mono text-xs text-gray-600 break-all">{result.documentHash}</p>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 text-center">
          <Link to="/" className="text-indigo-600 hover:underline text-sm">← Back to DocSign</Link>
        </div>
      </div>
    </div>
  );
};

export default Verify;