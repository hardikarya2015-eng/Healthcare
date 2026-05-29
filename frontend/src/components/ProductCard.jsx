import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';

const CATEGORY_STYLES = {
  medicines:     { from: 'from-teal-50',  to: 'to-emerald-100', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-teal-400' },
  vitamins:      { from: 'from-orange-50', to: 'to-amber-100',   icon: 'M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07l-.71.71M6.34 17.66l-.71.71m12.02 0l-.71-.71M6.34 6.34l-.71-.71M12 7a5 5 0 100 10A5 5 0 0012 7z', color: 'text-orange-400' },
  'personal-care': { from: 'from-pink-50', to: 'to-rose-100',  icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-pink-400' },
  devices:       { from: 'from-blue-50',  to: 'to-sky-100',    icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18', color: 'text-blue-400' },
  'baby-care':   { from: 'from-yellow-50',to: 'to-lime-100',   icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-yellow-500' },
  fitness:       { from: 'from-purple-50',to: 'to-violet-100', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-purple-400' },
  'skin-care':   { from: 'from-rose-50',  to: 'to-fuchsia-100',icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', color: 'text-rose-400' },
  diabetes:      { from: 'from-teal-50',  to: 'to-cyan-100',   icon: 'M4.5 12.75l6 6 9-13.5', color: 'text-teal-500' },
};

const DEFAULT_STYLE = { from: 'from-gray-50', to: 'to-slate-100', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'text-gray-300' };

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const {
    id, name, slug, brand, manufacturer, price, discount_percent, discounted_price,
    image_url, prescription_required, categories, inventory,
  } = product;

  const inStock = (inventory?.stock_quantity ?? 0) > 0;
  const finalPrice = discounted_price ?? price;

  const catSlug = categories?.slug || '';
  const style = CATEGORY_STYLES[catSlug] || DEFAULT_STYLE;
  const showPlaceholder = !image_url || imgError;

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    await addToCart(id);
    setAdding(false);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col group"
    >
      {/* Image area */}
      <Link to={`/products/${slug || id}`} className={`relative block bg-gradient-to-br ${style.from} ${style.to} h-44 overflow-hidden`}>
        {!showPlaceholder ? (
          <img
            src={image_url}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className={`w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm`}>
              <svg className={`w-8 h-8 ${style.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={style.icon} />
              </svg>
            </div>
            {categories?.name && (
              <span className={`text-[10px] font-bold uppercase tracking-widest ${style.color} opacity-70`}>{categories.name}</span>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount_percent > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              {discount_percent}% OFF
            </span>
          )}
        </div>
        {prescription_required && (
          <span className="absolute top-2.5 right-2.5 bg-orange-100 text-orange-700 text-[10px] font-semibold px-2 py-0.5 rounded-lg">
            Rx
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-800/80 text-white text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {categories?.name && (
          <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide mb-1">{categories.name}</span>
        )}
        <Link to={`/products/${slug || id}`}>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug hover:text-teal-600 transition-colors line-clamp-2 mb-1">
            {name}
          </h3>
        </Link>
        {(brand || manufacturer) && (
          <p className="text-xs text-gray-400 mb-3 truncate">by {brand || manufacturer}</p>
        )}

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-extrabold text-gray-900">{formatPrice(finalPrice)}</span>
            {discount_percent > 0 && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(price)}</span>
            )}
          </div>

          {/* Add to cart */}
          {inStock ? (
            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 bg-teal-50 hover:bg-teal-500 text-teal-700 hover:text-white border border-teal-200 hover:border-teal-500 text-xs font-semibold py-2.5 rounded-xl transition-all duration-200 disabled:opacity-60"
            >
              {adding ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          ) : (
            <button disabled className="w-full bg-gray-100 text-gray-400 text-xs font-semibold py-2.5 rounded-xl cursor-not-allowed">
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
