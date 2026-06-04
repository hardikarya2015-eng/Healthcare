import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';

// ─── Match Card ───────────────────────────────────────────────────────────────
const MatchCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const inStock = (product.inventory?.stock_quantity ?? 0) > 0;
  const finalPrice = product.discounted_price ?? product.price;

  const handleAdd = async () => { setAdding(true); await addToCart(product.id); setAdding(false); };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 flex gap-3 hover:shadow-md transition-shadow">
      <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-cyan-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-1" />
          : <svg className="w-6 h-6 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <Link to={`/products/${product.slug || product.id}`} className="text-sm font-semibold text-gray-900 hover:text-teal-600 line-clamp-2 leading-snug">
            {product.name}
          </Link>
        </div>
        {(product.brand || product.manufacturer) && (
          <p className="text-xs text-gray-400 mb-2 truncate">by {product.brand || product.manufacturer}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-gray-900">{formatPrice(finalPrice)}</span>
            {product.discount_percent > 0 && <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.price)}</span>}
          </div>
          {inStock ? (
            <button onClick={handleAdd} disabled={adding}
              className="text-xs bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 hover:border-teal-600 px-2.5 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-60 flex items-center gap-1">
              {adding
                ? <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              }
              Add
            </button>
          ) : (
            <span className="text-[10px] text-gray-400">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Medicine Tag ─────────────────────────────────────────────────────────────
const FREQ = { OD: 'Once daily', BD: 'Twice daily', TDS: '3× daily', QID: '4× daily', SOS: 'As needed', HS: 'At bedtime' };

const MedicineTag = ({ med }) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-900">{med.medicine_name}</span>
          {med.generic_name && med.generic_name !== med.medicine_name && (
            <span className="text-xs text-gray-400">({med.generic_name})</span>
          )}
        </div>
        <div className="flex gap-3 mt-1 flex-wrap text-xs text-gray-500">
          {med.dosage && <span>{med.dosage}</span>}
          {med.frequency && <span>· {FREQ[med.frequency] || med.frequency}</span>}
          {med.duration && <span>· {med.duration}</span>}
          {med.instructions && <span className="italic text-gray-400">· {med.instructions}</span>}
        </div>
      </div>
    </div>
  );
};

// ─── Results ──────────────────────────────────────────────────────────────────
const Results = ({ data }) => {
  const { extracted_medicines = [], recommendations = [], needs_review } = data;

  if (!extracted_medicines.length) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="font-semibold text-gray-800 mb-1">No medicines detected</p>
        <p className="text-sm text-gray-400">Try a clearer photo with good lighting. A pharmacist will review this prescription.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Prescription Analysis</h3>
          <p className="text-xs text-gray-400 mt-0.5">{extracted_medicines.length} medicine{extracted_medicines.length !== 1 ? 's' : ''} found</p>
        </div>
        {needs_review && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-100 px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Pharmacist review pending
          </span>
        )}
      </div>

      {recommendations.map((rec, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="space-y-3">
          <MedicineTag med={rec.prescribed} />
          {rec.matches.length > 0 ? (
            <div className="pl-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Available in our store</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rec.matches.map((p) => <MatchCard key={p.id} product={p} />)}
              </div>
            </div>
          ) : (
            <div className="pl-3">
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between">
                <span>No products found for <span className="font-medium text-gray-600">{rec.prescribed.medicine_name}</span></span>
                <Link to={`/products?search=${encodeURIComponent(rec.prescribed.medicine_name)}`} className="text-teal-600 hover:underline ml-2 whitespace-nowrap">Search →</Link>
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const UploadPrescription = () => {
  useCart(); // keep cart context connected
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type)) return toast.error('Only JPG, PNG, WEBP or PDF');
    if (f.size > 5 * 1024 * 1024) return toast.error('Max file size is 5MB');
    setFile(f);
    setResults(null);
    setPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResults(null);
    try {
      const formData = new FormData();
      formData.append('prescription', file);
      const res = await api.post('/api/prescriptions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResults(null); };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Upload Prescription</h1>
        <p className="text-sm text-gray-400 mt-0.5">Get medicine recommendations instantly from your doctor's prescription</p>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {!results ? (
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragging ? 'border-teal-400 bg-teal-50' : file ? 'border-teal-300 bg-teal-50/30' : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'}`}
            >
              <input type="file" accept="image/*,.pdf" className="hidden" id="rx-upload" onChange={(e) => handleFile(e.target.files[0])} />
              <label htmlFor="rx-upload" className="cursor-pointer block">
                {!file ? (
                  <>
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-700 mb-1">Drag & drop or click to upload</p>
                    <p className="text-xs text-gray-400">JPG, PNG, PDF · Max 5MB</p>
                  </>
                ) : (
                  <p className="font-medium text-teal-700">{file.name} <span className="text-gray-400 text-xs ml-1">· Click to change</span></p>
                )}
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <img src={preview} alt="Prescription preview" className="w-full max-h-52 object-contain rounded-xl border border-gray-200 bg-gray-50" />
            )}

            {/* Action buttons */}
            {file && (
              <div className="flex gap-3">
                <button onClick={handleAnalyze} disabled={analyzing} className="flex-1 btn-primary py-3 text-sm">
                  {analyzing
                    ? <span className="flex items-center gap-2 justify-center"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Analyzing prescription...</span>
                    : <span className="flex items-center gap-2 justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        Analyze
                      </span>
                  }
                </button>
                <button onClick={reset} className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Clear
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <Results data={results} />
            <button onClick={reset} className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Upload another prescription
            </button>
          </div>
        )}
      </div>

      {/* Analyzing overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-teal-100 p-8 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
            <p className="font-semibold text-gray-800 mb-1">Reading your prescription...</p>
            <p className="text-sm text-gray-400">AI is extracting medicines and finding the best matches</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How it works */}
      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
        <p className="font-semibold text-teal-800 mb-3 flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          How it works
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { step: '1', label: 'Upload prescription image or PDF' },
            { step: '2', label: 'AI reads and extracts all medicines' },
            { step: '3', label: 'Matched & generic alternatives shown' },
            { step: '4', label: 'Add to cart directly — image deleted' },
          ].map(({ step, label }) => (
            <div key={step} className="text-center">
              <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">{step}</div>
              <p className="text-xs text-teal-700 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPrescription;
