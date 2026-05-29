import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-8xl font-bold text-teal-100 mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex justify-center space-x-4">
        <Link to="/" className="btn-primary">Go Home</Link>
        <Link to="/products" className="btn-secondary">Browse Products</Link>
      </div>
    </motion.div>
  </div>
);

export default NotFound;
