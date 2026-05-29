import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <Logo size={32} />
            <span className="text-xl font-bold text-white tracking-tight">
              Pharm<span className="text-teal-400">Easy</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-500 mb-5">
            India&apos;s trusted online pharmacy. Order genuine medicines, health products and more with fast, reliable delivery.
          </p>
          <div className="flex gap-3">
            {['App Store', 'Google Play'].map((s) => (
              <div key={s} className="bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 px-3 py-2 rounded-lg cursor-pointer transition-colors">
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm">Shop</h3>
          <ul className="space-y-3 text-sm">
            {[
              { to: '/products', label: 'All Products' },
              { to: '/products?category_slug=medicines', label: 'Medicines' },
              { to: '/products?category_slug=vitamins', label: 'Vitamins & Supplements' },
              { to: '/products?category_slug=devices', label: 'Devices & Monitors' },
              { to: '/products?sort=discount', label: 'Best Deals' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm">Account</h3>
          <ul className="space-y-3 text-sm">
            {[
              { to: '/orders', label: 'My Orders' },
              { to: '/cart', label: 'Cart' },
              { to: '/upload-prescription', label: 'Upload Prescription' },
              { to: '/profile', label: 'Profile & Addresses' },
              { to: '/login', label: 'Login / Register' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm">Help & Info</h3>
          <ul className="space-y-3 text-sm">
            {['About Us', 'Privacy Policy', 'Terms of Service', 'Contact Us', 'FAQs'].map((label) => (
              <li key={label}>
                <a href="#" className="hover:text-white transition-colors">{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
        <p>&copy; {new Date().getFullYear()} PharmEasy Clone. All rights reserved.</p>
        <p>Built with React + Supabase + TailwindCSS</p>
      </div>
    </div>
  </footer>
);

export default Footer;
