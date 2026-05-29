import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { adminService } from '../services/admin.service';

const ManageInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [qty, setQty] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef(null);
  const uploadTargetRef = useRef(null);

  useEffect(() => {
    adminService.getInventory().then((r) => setInventory(r.data?.data || [])).finally(() => setLoading(false));
  }, []);

  const handleSave = async (id) => {
    setSaving(true);
    try {
      await adminService.updateInventory(id, parseInt(qty));
      setInventory((prev) => prev.map((i) => i.id === id ? { ...i, stock_quantity: parseInt(qty) } : i));
      toast.success('Stock updated');
      setEditId(null);
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const handleImageClick = (productId) => {
    uploadTargetRef.current = productId;
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const productId = uploadTargetRef.current;
    setUploadingId(productId);
    try {
      const res = await adminService.uploadProductImage(productId, file);
      const newUrl = res.data?.data?.image_url;
      setInventory((prev) => prev.map((i) =>
        i.products?.id === productId
          ? { ...i, products: { ...i.products, image_url: newUrl } }
          : i
      ));
      toast.success('Image updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  const filtered = inventory.filter((i) =>
    i.products?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const stockColor = (q) => {
    if (q === 0) return 'text-red-600 bg-red-50';
    if (q < 10) return 'text-orange-600 bg-orange-50';
    return 'text-teal-600 bg-teal-50';
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Inventory Management</h1>

      <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
        className="input w-full max-w-sm text-sm" />

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.products?.name}</p>
                      {item.products?.manufacturer && <p className="text-xs text-gray-400">{item.products.manufacturer}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.products?.image_url
                            ? <img src={item.products.image_url} alt="" className="w-full h-full object-contain" />
                            : <span className="text-lg">💊</span>}
                        </div>
                        <button
                          onClick={() => handleImageClick(item.products?.id)}
                          disabled={uploadingId === item.products?.id}
                          className="text-xs text-teal-600 hover:underline disabled:opacity-50"
                        >
                          {uploadingId === item.products?.id ? 'Uploading...' : item.products?.image_url ? 'Change' : 'Upload'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.products?.category?.name || '—'}</td>
                    <td className="px-4 py-3">
                      {editId === item.id ? (
                        <input
                          type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)}
                          className="input w-24 text-sm py-1.5" autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(item.id); if (e.key === 'Escape') setEditId(null); }}
                        />
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stockColor(item.stock_quantity)}`}>
                          {item.stock_quantity} units
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === item.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleSave(item.id)} disabled={saving} className="text-xs text-teal-600 hover:underline disabled:opacity-60">Save</button>
                          <button onClick={() => setEditId(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditId(item.id); setQty(String(item.stock_quantity)); }} className="text-xs text-teal-600 hover:underline">
                          Update Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No inventory records found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInventory;
