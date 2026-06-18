import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

const Sign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef();
  const [doc, setDoc] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [signing, setSigning] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const { data } = await API.get(`/api/documents/${id}`);
        setDoc(data);
      } catch {
        toast.error('Document not found');
        navigate('/dashboard');
      }
    };
    fetchDoc();
  }, [id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [doc]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    if (!hasSignature) return toast.error('Please draw your signature first');
    setSigning(true);
    try {
      const canvas = canvasRef.current;
      const signatureDataUrl = canvas.toDataURL('image/png');
      await API.post(`/api/documents/sign/${id}`, { signatureDataUrl });
      toast.success('Document signed successfully!');
      navigate('/dashboard');
    } catch {
      toast.error('Signing failed. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">DocSign</h1>
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">← Back</button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign Document</h2>
        {doc && <p className="text-gray-500 mb-6">{doc.originalName}</p>}

        {doc?.status === 'signed' ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-700 font-semibold text-lg">This document is already signed</p>
            <button onClick={() => navigate('/dashboard')}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 mb-4 font-medium">Draw your signature below:</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden mb-4">
              <canvas ref={canvasRef} width={580} height={200}
                className="w-full touch-none cursor-crosshair"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
            </div>
            <div className="flex gap-3">
              <button onClick={clearCanvas}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50">
                Clear
              </button>
              <button onClick={handleSign} disabled={signing || !hasSignature}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {signing ? 'Signing...' : 'Sign Document'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Your signature will be embedded into the PDF and a verification link will be generated
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sign;