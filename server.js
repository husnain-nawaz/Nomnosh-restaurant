import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/mysql-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'nom_nosh_pizza_secret_key_2026';

const app = express();
app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err) req.user = decoded;
    next();
  });
}

// ----------------- AUTH ROUTES ----------------- //

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const newUser = db.createUser({
    name,
    email,
    password_hash: password,
    role: 'customer',
    phone,
    address
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar_url: newUser.avatar_url,
      phone: newUser.phone,
      address: newUser.address
    }
  });
});

// Email/Password Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.getUserByEmail(email);
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      phone: user.phone,
      address: user.address
    }
  });
});

// Google Authentication Route (Supports Google JWT ID tokens or direct profile payload)
app.post('/api/auth/google', (req, res) => {
  const { googleToken, email, name, picture, sub } = req.body;
  const userEmail = email || 'google.user@example.com';
  const userName = name || 'Google Foodie';
  const googleId = sub || 'gid_' + Math.random().toString(36).substring(2, 9);
  const avatar = picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

  let user = db.getUserByEmail(userEmail);
  if (!user) {
    user = db.createUser({
      name: userName,
      email: userEmail,
      google_id: googleId,
      avatar_url: avatar,
      role: 'customer'
    });
  } else if (!user.google_id) {
    user.google_id = googleId;
    if (avatar) user.avatar_url = avatar;
    db.saveDatabase();
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      phone: user.phone,
      address: user.address
    }
  });
});

// Current User Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      phone: user.phone,
      address: user.address
    }
  });
});

// ----------------- CATALOG ROUTES ----------------- //

// Categories
app.get('/api/categories', (req, res) => {
  res.json(db.getCategories());
});

// Menu Items (with category & search)
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  const items = db.getMenuItems(category, search);
  res.json(items);
});

// Add Menu Item (Admin)
app.post('/api/products', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  const item = db.addMenuItem(req.body);
  res.status(201).json(item);
});

// Update Menu Item (Admin)
app.put('/api/products/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  const updated = db.updateMenuItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json(updated);
});

// Delete Menu Item (Admin)
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  const deleted = db.deleteMenuItem(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true, message: 'Item deleted' });
});

// ----------------- ORDERS ROUTES ----------------- //

// Get Orders
app.get('/api/orders', optionalToken, (req, res) => {
  const allOrders = db.getOrders();
  if (req.user && req.user.role === 'admin') {
    return res.json(allOrders);
  }
  if (req.user) {
    const userOrders = allOrders.filter(o => o.user_id === req.user.id || o.customer_email === req.user.email);
    return res.json(userOrders);
  }
  res.json([]);
});

// Create Order
app.post('/api/orders', optionalToken, (req, res) => {
  const orderData = req.body;
  if (!orderData.customer_name || !orderData.customer_phone || !orderData.delivery_address) {
    return res.status(400).json({ error: 'Name, phone, and delivery address are required' });
  }
  if (!orderData.items || orderData.items.length === 0) {
    return res.status(400).json({ error: 'Cart cannot be empty' });
  }

  if (req.user) {
    orderData.user_id = req.user.id;
    if (!orderData.customer_email) orderData.customer_email = req.user.email;
  }

  const createdOrder = db.createOrder(orderData);
  res.status(201).json(createdOrder);
});

// Update Order Status (Admin)
app.put('/api/orders/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  const { status } = req.body;
  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

// ----------------- DASHBOARD ANALYTICS ----------------- //

app.get('/api/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }

  const orders = db.getOrders();
  const items = db.getMenuItems();
  const users = db.getUsers();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const preparingOrders = orders.filter(o => o.status === 'preparing').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const onWayOrders = orders.filter(o => o.status === 'on_way').length;

  res.json({
    totalRevenue,
    totalOrders: orders.length,
    pendingOrders,
    preparingOrders,
    onWayOrders,
    deliveredOrders,
    totalMenuItems: items.length,
    totalUsers: users.length,
    recentOrders: orders.slice(0, 5)
  });
});

// ----------------- MYSQL CONSOLE & SCHEMA ROUTES ----------------- //

app.get('/api/mysql/schema', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  res.json(db.getSchema());
});

app.post('/api/mysql/query', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'SQL query string required' });
  const result = db.executeSql(sql);
  res.json(result);
});

app.post('/api/mysql/reset', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  db.resetToDefault();
  res.json({ success: true, message: 'MySQL database reset to initial seed data' });
});

// ----------------- VITE INTEGRATION ----------------- //

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
