import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { addressService } from '../services/address.service';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editAddr, setEditAddr] = useState(null);
  const [addrForm, setAddrForm] = useState({ label: 'Home', line1: '', city: '', state: '', pincode: '', phone: '' });

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || '', phone: user.phone || '' });
    addressService.getAll().then((r) => setAddresses(r.data?.data || []));
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.put('/api/users/profile', form);
      updateUser(r.data?.data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const openEditAddr = (a) => {
    setEditAddr(a.id);
    setAddrForm({ label: a.label, line1: a.line1, city: a.city, state: a.state, pincode: a.pincode, phone: a.phone || '' });
    setShowAddrForm(true);
  };

  const handleAddrSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editAddr) {
        const r = await addressService.update(editAddr, addrForm);
        setAddresses((prev) => prev.map((a) => a.id === editAddr ? r.data?.data : a));
        toast.success('Address updated');
      } else {
        const r = await addressService.add({ ...addrForm, is_default: addresses.length === 0 });
        setAddresses((prev) => [...prev, r.data?.data]);
        toast.success('Address added');
      }
      setShowAddrForm(false);
      setEditAddr(null);
      setAddrForm({ label: 'Home', line1: '', city: '', state: '', pincode: '', phone: '' });
    } catch {
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddr = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await addressService.remove(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefault(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
    } catch {
      toast.error('Failed to set default');
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Profile</h1>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.full_name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="input" required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input" placeholder="+91 99999 00000" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={user?.email || ''} className="input bg-gray-50" disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Saved Addresses</h2>
          <button
            onClick={() => { setEditAddr(null); setAddrForm({ label: 'Home', line1: '', city: '', state: '', pincode: '', phone: '' }); setShowAddrForm(true); }}
            className="text-sm text-teal-600 hover:underline"
          >
            + Add Address
          </button>
        </div>

        {showAddrForm && (
          <form onSubmit={handleAddrSubmit} className="mb-4 space-y-3 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-800 text-sm">{editAddr ? 'Edit Address' : 'New Address'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Label</label>
                <select value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} className="input text-sm py-1.5">
                  {['Home', 'Work', 'Other'].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs">Phone</label>
                <input value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                  className="input text-sm py-1.5" placeholder="+91..." />
              </div>
            </div>
            <div>
              <label className="label text-xs">Address Line</label>
              <input value={addrForm.line1} onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
                className="input text-sm py-1.5" placeholder="Street, Building, Area" required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['city', 'state', 'pincode'].map((f) => (
                <div key={f}>
                  <label className="label text-xs capitalize">{f}</label>
                  <input value={addrForm[f]} onChange={(e) => setAddrForm({ ...addrForm, [f]: e.target.value })}
                    className="input text-sm py-1.5" required />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm py-1.5 px-4">{editAddr ? 'Update' : 'Save'}</button>
              <button type="button" onClick={() => { setShowAddrForm(false); setEditAddr(null); }} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </form>
        )}

        {addresses.length === 0 ? (
          <p className="text-sm text-gray-400">No addresses saved yet.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((a) => (
              <div key={a.id} className={`p-3 rounded-xl border ${a.is_default ? 'border-teal-300 bg-teal-50' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{a.label} {a.is_default && <span className="text-xs text-teal-600">(Default)</span>}</p>
                    <p className="text-gray-500">{a.line1}, {a.city}, {a.state} - {a.pincode}</p>
                    {a.phone && <p className="text-gray-400 text-xs mt-0.5">{a.phone}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!a.is_default && (
                      <button onClick={() => handleSetDefault(a.id)} className="text-xs text-teal-600 hover:underline">Set default</button>
                    )}
                    <button onClick={() => openEditAddr(a)} className="text-xs text-gray-500 hover:text-gray-700">Edit</button>
                    <button onClick={() => handleDeleteAddr(a.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
