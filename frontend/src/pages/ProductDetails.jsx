import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { productService } from '../services/product.service';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    productService.getById(id).then((r) => setProduct(r.data?.data)).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      toast.success('Added to cart!');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12"><Loader /></div>;
  if (!product) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
      <p className="text-5xl mb-4">😕</p>
      <p>Product not found.</p>
      <Link to="/products" className="mt-4 inline-block text-teal-600 hover:underline">Back to products</Link>
    </div>
  );

  const inStock = product.inventory?.stock_quantity > 0;
  const discountPct = product.discount_percent || 0;
  const finalPrice = product.discounted_price ?? product.price;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1">
        <Link to="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-teal-600">Products</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link to={`/products?category_slug=${product.categories.slug}`} className="hover:text-teal-600">
              {product.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-600 truncate">{product.name}</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-80 bg-gray-50 flex items-center justify-center p-8 relative">
            {discountPct > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discountPct}%
              </span>
            )}
            {product.prescription_required && (
              <span className="absolute top-4 right-4 bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                Rx Required
              </span>
            )}
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-48 h-48 object-contain" />
            ) : (
              <div className="text-8xl">💊</div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-6 md:p-8">
            {product.categories && (
              <p className="text-xs text-teal-600 font-medium uppercase tracking-wide mb-1">
                {product.categories.name}
              </p>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h1>
            {product.manufacturer && (
              <p className="text-sm text-gray-400 mb-4">by {product.manufacturer}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(finalPrice)}</span>
              {discountPct > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="text-teal-600 text-sm font-semibold">Save {discountPct}%</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full mb-6 ${
              inStock ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'
            }`}>
              <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-teal-500' : 'bg-red-400'}`} />
              {inStock ? `In Stock (${product.inventory.stock_quantity} left)` : 'Out of Stock'}
            </div>

            {product.prescription_required && (
              <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3 mb-5 text-sm text-orange-700">
                <span>📋</span>
                <span>This product requires a valid prescription. Please <Link to="/upload-prescription" className="underline font-medium">upload your prescription</Link> before ordering.</span>
              </div>
            )}

            {/* Quantity + Cart */}
            {inStock && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-lg font-medium">−</button>
                  <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.inventory.stock_quantity, qty + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-lg font-medium">+</button>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-60"
                >
                  {adding ? 'Adding...' : 'Add to Cart'}
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="border-t border-gray-100 p-6 md:p-8">
            <h2 className="font-semibold text-gray-800 mb-2">About this product</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
