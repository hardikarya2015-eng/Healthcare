require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes         = require('./routes/auth.routes');
const userRoutes         = require('./routes/user.routes');
const productRoutes      = require('./routes/product.routes');
const categoryRoutes     = require('./routes/category.routes');
const cartRoutes         = require('./routes/cart.routes');
const orderRoutes        = require('./routes/order.routes');
const addressRoutes      = require('./routes/address.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const paymentRoutes      = require('./routes/payment.routes');
const adminRoutes        = require('./routes/admin.routes');

const { errorHandler }   = require('./middleware/error.middleware');
const { requestLogger }  = require('./middleware/logger.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow any localhost origin in dev
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'PharmEasy API', timestamp: new Date().toISOString() })
);

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/cart',          cartRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/addresses',     addressRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/admin',         adminRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

app.listen(PORT, () => console.log(`PharmEasy API running on http://localhost:${PORT}`));
module.exports = app;
