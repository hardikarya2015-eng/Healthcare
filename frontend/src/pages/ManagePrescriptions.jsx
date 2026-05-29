import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { adminService } from '../services/admin.service';
import { formatDate } from '../utils/helpers';

const ManagePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    adminService.getPrescriptions({ status: filter })
      .then((r) => setPrescriptions(r.data?.data || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await adminService.updatePrescriptionStatus(id, status);
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Prescription ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor = (s) => ({
    pending: 'bg-yellow-50 text-yellow-700',
    approved: 'bg-teal-50 text-teal-700',
    rejected: 'bg-red-50 text-red-700',
  }[s] || 'bg-gray-100 text-gray-600');

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Manage Prescriptions</h1>

      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s ? 'bg-teal-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
            }`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <div className="space-y-3">
          {prescriptions.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-card">
              <p className="text-4xl mb-3">📋</p>
              <p>No {filter} prescriptions</p>
            </div>
          ) : prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white rounded-2xl shadow-card p-5 flex flex-col sm:flex-row gap-4">
              <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                {rx.file_url && rx.file_name?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <img src={rx.file_url} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-3xl">📋</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{rx.users?.full_name || 'Unknown User'}</p>
                <p className="text-xs text-gray-400">{rx.users?.email}</p>
                <p className="text-sm text-gray-600 mt-1 truncate">{rx.file_name}</p>
                <p className="text-xs text-gray-400">{formatDate(rx.created_at)}</p>
              </div>

              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(rx.status)}`}>
                  {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                </span>
                <a href={rx.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:underline">
                  View File
                </a>
                {rx.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleStatus(rx.id, 'approved')} disabled={updatingId === rx.id}
                      className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-60">
                      Approve
                    </button>
                    <button onClick={() => handleStatus(rx.id, 'rejected')} disabled={updatingId === rx.id}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-60">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagePrescriptions;
