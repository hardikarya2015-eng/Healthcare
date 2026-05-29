import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Toaster } from 'react-hot-toast';

const DashboardLayout = () => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    <Navbar />
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  </div>
);

export default DashboardLayout;
