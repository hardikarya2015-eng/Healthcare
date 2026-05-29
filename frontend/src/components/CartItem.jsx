import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { products: product, quantity } = item;
  const price = product?.discounted_price ?? product?.price ?? 0;
  const image = product?.image_url;

  return (
    <div className="flex items-start space-x-4 py-4 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
        {image
          ? <img src={image} alt={product?.name} className="w-full h-full object-contain p-1 rounded-lg" />
          : <span className="text-2xl">💊</span>
        }
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link to={`/products/${product?.slug || product?.id}`}>
          <p className="text-sm font-medium text-gray-900 hover:text-teal-600 transition-colors line-clamp-2">{product?.name}</p>
        </Link>
        <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(price)}</p>
        {product?.discount_percent > 0 && (
          <p className="text-xs text-teal-600">{product.discount_percent}% off</p>
        )}
        {product?.prescription_required && (
          <span className="text-xs text-orange-600 font-medium">Rx required</span>
        )}
      </div>

      {/* Quantity + remove */}
      <div className="flex flex-col items-end space-y-2 flex-shrink-0">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => quantity > 1 ? updateQuantity(product.id, quantity - 1) : removeFromCart(product.id)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg"
          >
            +
          </button>
        </div>
        <button
          onClick={() => removeFromCart(product.id)}
          className="text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
