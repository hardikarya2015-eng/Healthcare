import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import NotFound from './pages/NotFound';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import UploadPrescription from './pages/UploadPrescription';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from './pages/ManageProducts';
import ManageOrders from './pages/ManageOrders';
import ManageInventory from './pages/ManageInventory';
import ManagePrescriptions from './pages/ManagePrescriptions';
import ManageUsers from './pages/ManageUsers';

// Components
import ProtectedRoute from './components/ProtectedRoute';

const App = () => (
  <AuthProvider>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes with Navbar + Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={
                <div className="text-center py-24 text-gray-500">
                  <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                  <p>You are not authorized to view this page.</p>
                </div>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Customer Dashboard */}
          <Route
            element={
              <ProtectedRoute roles={['customer']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/upload-prescription" element={<UploadPrescription />} />
          </Route>

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="inventory" element={<ManageInventory />} />
            <Route path="prescriptions" element={<ManagePrescriptions />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </AuthProvider>
);

export default App;
