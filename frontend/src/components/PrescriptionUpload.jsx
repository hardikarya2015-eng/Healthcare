import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import api from '../services/api';

const PrescriptionUpload = ({ onUploaded }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type)) return toast.error('Only JPG, PNG, WEBP or PDF allowed');
    if (f.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB');
    setFile(f);
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first');
    setUploading(true);
    try {
      // Upload to Supabase Storage
      const ext = file.name.split('.').pop();
      const path = `prescriptions/${Date.now()}.${ext}`;
      const { error: storageError } = await supabase.storage
        .from('prescriptions')
        .upload(path, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(path);

      // Save record in DB
      const { data } = await api.post('/api/prescriptions', {
        file_url: publicUrl,
        file_name: file.name,
      });

      toast.success('Prescription uploaded successfully!');
      setFile(null);
      setPreview(null);
      onUploaded?.(data.data);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
        }`}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          id="prescription-upload"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <label htmlFor="prescription-upload" className="cursor-pointer">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium text-gray-700 mb-1">
            {file ? file.name : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-gray-400">Supports JPG, PNG, PDF · Max 5MB</p>
        </label>
      </div>

      {/* Preview */}
      {preview && (
        <img src={preview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border border-gray-200" />
      )}

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {uploading ? 'Uploading...' : 'Upload Prescription'}
        </button>
      )}
    </div>
  );
};

export default PrescriptionUpload;
