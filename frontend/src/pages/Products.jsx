import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { CATEGORIES, SORT_OPTIONS } from '../constants';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category_slug') || '';
  const sort = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 12;

  useEffect(() => {
    categoryService.getAll().then((r) => setCategories(r.data?.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    productService
      .getProducts({ search, category_slug: categorySlug, sort, page, limit })
      .then((r) => {
        setProducts(r.data?.data || []);
        setTotal(r.data?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [search, categorySlug, sort, page]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const totalPages = Math.ceil(total / limit);
  const displayCategories = categories.length > 0
    ? categories.map((c) => ({ ...c, icon: CATEGORIES.find((k) => k.slug === c.slug)?.icon || '💊' }))
    : CATEGORIES;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {categorySlug
              ? displayCategories.find((c) => c.slug === categorySlug)?.name || 'Products'
              : search ? `Results for "${search}"` : 'All Products'}
          </h1>
          {!loading && <p className="text-sm text-gray-400 mt-0.5">{total} products found</p>}
        </div>
        <select
          value={sort}
          onChange={(e) => setParam('sort', e.target.value)}
          className="input w-auto text-sm py-2"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-card p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Categories</h3>
            <button
              onClick={() => setParam('category_slug', '')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                !categorySlug ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {displayCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setParam('category_slug', cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors flex items-center gap-2 ${
                  categorySlug === cat.slug ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Search input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products..."
              defaultValue={search}
              onKeyDown={(e) => { if (e.key === 'Enter') setParam('search', e.target.value); }}
              className="input w-full text-sm"
            />
          </div>

          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-medium">No products found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setParam('page', String(page - 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setParam('page', String(p))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === p ? 'bg-teal-500 text-white' : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setParam('page', String(page + 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
