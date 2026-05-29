import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const COLORS = [
  'bg-teal-50 text-teal-600 group-hover:bg-teal-100',
  'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
  'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
  'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
  'bg-pink-50 text-pink-600 group-hover:bg-pink-100',
  'bg-teal-50 text-teal-600 group-hover:bg-teal-100',
  'bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100',
  'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
];

let colorIndex = 0;
const getColor = () => COLORS[colorIndex++ % COLORS.length];

const CategoryCard = ({ category }) => {
  const { name, slug, icon, image_url } = category;
  const colorClass = getColor();

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
      <Link
        to={`/products?category_slug=${slug}`}
        className="flex flex-col items-center gap-2.5 p-3 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group cursor-pointer"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors ${colorClass}`}>
          {icon
            ? <span>{icon}</span>
            : image_url
              ? <img src={image_url} alt={name} className="w-7 h-7 object-contain" />
              : <span>🏥</span>}
        </div>
        <span className="text-[11px] font-semibold text-gray-600 group-hover:text-gray-900 text-center leading-tight transition-colors">
          {name}
        </span>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
