import { Outlet, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Logo from '../components/Logo';

const AuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex flex-col">
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

    {/* Header */}
    <div className="py-5 px-8">
      <Link to="/" className="flex items-center gap-2.5 w-fit">
        <Logo size={32} />
        <span className="text-xl font-bold text-gray-900 tracking-tight">
          Pharm<span className="text-teal-600">Easy</span>
        </span>
      </Link>
    </div>

    {/* Content */}
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>

    {/* Footer note */}
    <p className="text-center text-xs text-gray-400 py-4">
      &copy; {new Date().getFullYear()} PharmEasy. Your health, our priority.
    </p>
  </div>
);

export default AuthLayout;
