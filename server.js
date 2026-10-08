import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/mysql-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'nom_nosh_pizza_secret_key_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const STORE_LATITUDE = Number(process.env.STORE_LATITUDE);
const STORE_LONGITUDE = Number(process.env.STORE_LONGITUDE);
const GEOCODER_USER_AGENT = process.env.GEOCODER_USER_AGENT || 'NomNoshDelivery/1.0';

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

function setSessionCookie(res, user) {
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie('nomnosh_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url, phone: user.phone, address: user.address };
}

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = req.cookies.nomnosh_session || (authHeader && authHeader.split(' ')[1]);
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = req.cookies.nomnosh_session || (authHeader && authHeader.split(' ')[1]);
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

  setSessionCookie(res, newUser);
  res.status(201).json({ user: publicUser(newUser) });
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

  setSessionCookie(res, user);
  res.json({ user: publicUser(user) });
});

// Google Identity Services authentication. The browser sends only the GIS credential.
app.post('/api/auth/google', (req, res) => {
  const { credential } = req.body;
  if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: 'Google Sign-In is not configured on the server' });
  if (!credential) return res.status(400).json({ error: 'Google credential is required' });

  googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID })
    .then(({ getPayload }) => {
      const payload = getPayload();
      if (!payload?.sub || !payload.email || !payload.email_verified) throw new Error('Google account could not be verified');
      const googleId = payload.sub;
      const userEmail = payload.email;
      const userName = payload.name || userEmail.split('@')[0];
      const avatar = payload.picture || null;
      let user = db.getUserByGoogleId(googleId) || db.getUserByEmail(userEmail);
      if (!user) {
        user = db.createUser({
          name: userName,
          email: userEmail,
          google_id: googleId,
          avatar_url: avatar,
          role: 'customer'
        });
      } else {
      user.google_id = googleId;
      user.name = userName;
      user.email = userEmail;
      if (avatar) user.avatar_url = avatar;
        db.saveDatabase();
      }
      setSessionCookie(res, user);
      res.json({ user: publicUser(user) });
    })
    .catch((error) => res.status(401).json({ error: error.message || 'Google login failed' }));
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('nomnosh_session', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  res.json({ success: true });
});

function distanceInKm(lat1, lon1, lat2, lon2) {
  const radians = value => value * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function reverseGeocode(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    const error = new Error('Valid latitude and longitude are required');
    error.statusCode = 400;
    throw error;
  }
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`, {
    headers: { 'User-Agent': GEOCODER_USER_AGENT, Accept: 'application/json' },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error('Address service unavailable');
  const data = await response.json();
  if (!data?.display_name) throw new Error('Address not found');
  return { address: data.display_name, latitude: lat, longitude: lng };
}

app.get('/api/geocode', async (req, res) => {
  try {
    const result = await reverseGeocode(req.query.lat, req.query.lng);
    const distanceKm = Number.isFinite(STORE_LATITUDE) && Number.isFinite(STORE_LONGITUDE)
      ? distanceInKm(STORE_LATITUDE, STORE_LONGITUDE, result.latitude, result.longitude)
      : null;
    res.json({
      ...result,
      deliveryAvailable: distanceKm === null ? null : distanceKm <= Number(process.env.DELIVERY_RADIUS_KM || 15),
      etaMinutes: distanceKm === null ? null : Math.max(25, Math.round(25 + distanceKm * 3)),
      distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2))
    });
  } catch (error) {
    res.status(error.statusCode || 502).json({ error: 'Unable to load the address' });
  }
});

// Resolve browser coordinates (or a manually entered address) server-side.
app.post('/api/location/resolve', async (req, res) => {
  const { latitude, longitude, address } = req.body || {};
  const hasCoordinates = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
  if (!hasCoordinates && !address?.trim()) return res.status(400).json({ error: 'Coordinates or an address is required' });

  try {
    const query = hasCoordinates
      ? `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`
      : `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address.trim())}`;
    const geocodeResponse = await fetch(query, { headers: { 'User-Agent': GEOCODER_USER_AGENT, Accept: 'application/json' } });
    if (!geocodeResponse.ok) throw new Error('Address service unavailable');
    const raw = await geocodeResponse.json();
    const result = Array.isArray(raw) ? raw[0] : raw;
    if (!result?.lat || !result?.lon) return res.status(404).json({ error: 'Unable to find a readable address for that location' });

    const resolvedLatitude = Number(result.lat);
    const resolvedLongitude = Number(result.lon);
    const distanceKm = Number.isFinite(STORE_LATITUDE) && Number.isFinite(STORE_LONGITUDE)
      ? distanceInKm(STORE_LATITUDE, STORE_LONGITUDE, resolvedLatitude, resolvedLongitude)
      : null;
    const deliveryAvailable = distanceKm === null ? null : distanceKm <= Number(process.env.DELIVERY_RADIUS_KM || 15);
    const etaMinutes = distanceKm === null ? null : Math.max(25, Math.round(25 + distanceKm * 3));

    res.json({
      address: result.display_name,
      latitude: resolvedLatitude,
      longitude: resolvedLongitude,
      deliveryAvailable,
      etaMinutes,
      distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2))
    });
  } catch (error) {
    res.status(502).json({ error: error.message || 'Unable to resolve this location' });
  }
});

// Current User Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
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
