import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

const Sign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef();
  const pdfCanvasRef = useRef();
  const [doc, setDoc] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [signing, setSigning] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfDocRef, setPdfDocRef] = useState(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const { data } = await API.get(`/api/documents/${id}`);
        setDoc(data);
      } catch {
        toast.error("Document not found");
        navigate("/dashboard");
      }
    };
    fetchDoc();
  }, [id]);

  // Load PDF preview using pdfjs-dist
  useEffect(() => {
    if (!doc?.originalUrl) return;

    const loadPdf = async () => {
      try {
        setPdfLoading(true);
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({
          url: `${import.meta.env.VITE_API_URL}/api/documents/preview/${id}`,
          httpHeaders: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const pdfDoc = await loadingTask.promise;
        setPdfDocRef(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        await renderPage(pdfDoc, 1);
      } catch (err) {
        console.error("PDF load error:", err);
        toast.error("Could not preview PDF");
      } finally {
        setPdfLoading(false);
      }
    };

    loadPdf();
  }, [doc]);

  const renderPage = async (pdfDoc, pageNum) => {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = pdfCanvasRef.current;
      if (!canvas) return;

      const containerWidth = canvas.parentElement?.clientWidth || 600;
      const viewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport: scaledViewport })
        .promise;
    } catch (err) {
      console.error("Page render error:", err);
    }
  };

  const handlePageChange = async (newPage) => {
    if (!pdfDocRef || newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    await renderPage(pdfDocRef, newPage);
  };

  // Signature canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [doc]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    if (!hasSignature) return toast.error("Please draw your signature first");
    setSigning(true);
    try {
      const canvas = canvasRef.current;
      const signatureDataUrl = canvas.toDataURL("image/png");
      await API.post(`/api/documents/sign/${id}`, { signatureDataUrl });
      toast.success("Document signed successfully!");
      navigate("/dashboard");
    } catch {
      toast.error("Signing failed. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">DocSign</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Sign Document</h2>
        {doc && (
          <p className="text-gray-500 mb-6 text-sm">{doc.originalName}</p>
        )}

        {doc?.status === "signed" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-700 font-semibold text-lg">
              This document is already signed
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: PDF Preview */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">
                  Document Preview
                </h3>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
                    >
                      ‹
                    </button>
                    <span>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              <div className="border rounded-lg overflow-auto max-h-[500px] bg-gray-100 flex items-center justify-center">
                {pdfLoading ? (
                  <div className="py-16 text-center text-gray-400">
                    <div className="text-4xl mb-2">📄</div>
                    <p>Loading preview...</p>
                  </div>
                ) : (
                  <canvas ref={pdfCanvasRef} className="w-full" />
                )}
              </div>

              <p className="text-xs text-gray-400 mt-2 text-center">
                Your signature will be placed at the bottom-right of the last
                page
              </p>
            </div>

            {/* RIGHT: Signature Canvas */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">
                  Draw Your Signature
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Use your mouse or finger to sign below
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden mb-4 bg-white">
                  <canvas
                    ref={canvasRef}
                    width={580}
                    height={200}
                    className="w-full touch-none cursor-crosshair"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                </div>

                {/* Signature indicator */}
                <div
                  className={`text-xs mb-4 text-center font-medium ${
                    hasSignature ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {hasSignature
                    ? "✅ Signature drawn"
                    : "No signature yet — draw above"}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={clearCanvas}
                  className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear Signature
                </button>
                <button
                  onClick={handleSign}
                  disabled={signing || !hasSignature}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-medium"
                >
                  {signing ? "Signing..." : "✍️ Sign Document"}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Signature will be embedded into the PDF — a SHA-256 hash and
                  verification link will be generated
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sign;
