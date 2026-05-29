import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { adminService } from '../services/admin.service';
import { categoryService } from '../services/category.service';
import api from '../services/api';
import { formatPrice } from '../utils/helpers';

const EMPTY = { name: '', slug: '', description: '', price: '', discount_percent: '0', manufacturer: '', category_id: '', prescription_required: false, image_url: '' };

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    api.get(`/api/products?limit=50&search=${search}`).then((r) => setProducts(r.data?.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    categoryService.getAll().then((r) => setCategories(r.data?.data || []));
  }, []);

  useEffect(() => { load(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), discount_percent: parseInt(form.discount_percent) || 0 };
      if (editId) {
        const r = await api.put(`/api/products/${editId}`, payload);
        setProducts((prev) => prev.map((p) => p.id === editId ? r.data?.data : p));
        toast.success('Product updated');
      } else {
        const r = await api.post('/api/products', payload);
        setProducts((prev) => [r.data?.data, ...prev]);
        toast.success('Product created');
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name || '', slug: p.slug || '', description: p.description || '', price: String(p.price || ''),
      discount_percent: String(p.discount_percent || 0), manufacturer: p.manufacturer || '',
      category_id: p.category_id || '', prescription_required: p.prescription_required || false, image_url: p.image_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Manage Products</h1>
        <button onClick={() => { setEditId(null); setForm(EMPTY); setShowForm(true); }}
          className="btn-primary text-sm py-2 px-4">+ Add Product</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">{editId ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Category</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Price (₹) *</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Discount %</label>
                <input type="number" min="0" max="100" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Manufacturer</label>
                <input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input" placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="rx" checked={form.prescription_required}
                onChange={(e) => setForm({ ...form, prescription_required: e.target.checked })} className="accent-teal-500" />
              <label htmlFor="rx" className="text-sm text-gray-700">Prescription required</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }} className="text-sm text-gray-500 hover:text-gray-700 px-4">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div>
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="input w-full max-w-sm text-sm" />
      </div>

      {/* Table */}
      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="px-4 py-3 font-medium">Rx</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.manufacturer && <p className="text-xs text-gray-400">{p.manufacturer}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-gray-500">{p.discount_percent > 0 ? `${p.discount_percent}%` : '—'}</td>
                    <td className="px-4 py-3">
                      {p.prescription_required
                        ? <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Yes</span>
                        : <span className="text-xs text-gray-400">No</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(p)} className="text-teal-600 hover:underline text-xs">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">💊</p>
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
