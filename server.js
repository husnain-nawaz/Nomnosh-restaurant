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
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const LOCATION_SCOPE = 'Punjab, Pakistan';

const app = express();
app.use(cors());
// Menu items may include one or more resized base64 images. Keep the request
// limit high enough for the admin upload flow; the client still compresses
// images before sending them.
app.use(express.json({ limit: '100mb' }));
app.use(cookieParser());

// Every request is scoped to one restaurant tenant. Platform routes can opt into
// the platform tenant explicitly; restaurant data never falls back across slugs.
app.use((req, _res, next) => {
  const slug = String(req.headers['x-restaurant-slug'] || 'nomnosh').toLowerCase().replace(/[^a-z0-9-]/g, '');
  db.ensureTenant(slug || 'nomnosh');
  db.runWithTenant(slug || 'nomnosh', next);
});

app.get('/api/config', (_req, res) => {
  res.json({ googleClientId: GOOGLE_CLIENT_ID || null });
});
app.post('/api/platform/applications', (req, res) => {
  const { name, email, restaurant, phone } = req.body || {};
  if (!name || !email || !restaurant) return res.status(400).json({ error: 'Name, email, and restaurant are required' });
  const duplicate = (db.db.platform_applications || []).find(item => item.email.toLowerCase() === String(email).toLowerCase() && item.restaurant.toLowerCase() === String(restaurant).toLowerCase() && item.status === 'pending');
  if (duplicate) return res.status(409).json({ error: 'An application for this email and restaurant is already pending.' });
  const application = db.insertCollection('platform_applications', { name: String(name), email: String(email), restaurant: String(restaurant), phone: String(phone || ''), status: 'pending' });
  res.status(201).json(application);
});
app.delete('/api/platform/applications/:id', (req, res) => {
  const applications = db.db.platform_applications || [];
  const index = applications.findIndex(item => String(item.id) === String(req.params.id));
  if (index < 0) return res.status(404).json({ error: 'Application not found' });
  applications.splice(index, 1); db.saveDatabase(); res.json({ success: true });
});
app.put('/api/platform/applications/:id/status', (req, res) => {
  const application = (db.db.platform_applications || []).find(item => String(item.id) === String(req.params.id));
  if (!application) return res.status(404).json({ error: 'Application not found' });
  const status = String(req.body?.status || '').toLowerCase();
  if (!['pending', 'active', 'paid', 'trial', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid application status' });
  if (status === 'active' && !application.tenant_slug_created) {
    const slug = String(application.restaurant).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `restaurant-${Date.now()}`;
    db.ensureTenant(slug);
    db.createEmptyTenant(slug);
    db.runWithTenant(slug, () => {
      if (!db.getUserByEmail(application.email)) db.createUser({ name: application.name, email: application.email, password_hash: application.password || 'change-me', role: 'super_admin', role_title: 'Restaurant Owner', permissions: ['*'] });
    });
    application.tenant_slug_created = slug;
  }
  application.status = status; application.updated_at = new Date().toISOString(); db.saveDatabase();
  res.json(application);
});
app.get('/api/platform/owner-access', (req, res) => {
  const token = req.cookies.nomnosh_session;
  let account = null;
  if (token) { try { const decoded = jwt.verify(token, JWT_SECRET); account = (db.db.users || []).find(user => user.id === Number(decoded.id)); } catch {} }
  const tenant = account?.tenant_slug || String(req.query.tenant || '').toLowerCase();
  let record = (db.db.platform_applications || []).find(item => item.tenant_slug_created === tenant && (!account || item.email.toLowerCase() === String(account.email || '').toLowerCase()));
  if (!record && (!account || account.tenant_slug === 'platform')) record = (db.db.platform_applications || []).filter(item => item.tenant_slug_created && ['active', 'paid', 'trial'].includes(item.status)).sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))[0];
  const resolvedTenant = record?.tenant_slug_created || tenant;
  res.json({ tenant_slug: resolvedTenant, email: record?.email || '', status: record?.status || 'pending', approved: ['active', 'paid', 'trial'].includes(record?.status) });
});
app.get('/api/platform/tenant-status/:slug', (req, res) => {
  const slug = String(req.params.slug || '').toLowerCase();
  const application = (db.db.platform_applications || []).find(item => item.tenant_slug_created === slug);
  if (!application && ['nomnosh', 'cheezious'].includes(slug)) return res.json({ allowed: true, status: 'active' });
  const allowed = Boolean(application && ['active', 'paid', 'trial'].includes(application.status));
  res.json({ allowed, status: application?.status || 'pending' });
});
app.delete('/api/platform/tenants/:slug', async (req, res) => {
  const slug = String(req.params.slug || '').toLowerCase();
  if (['nomnosh', 'cheezious', 'platform'].includes(slug)) return res.status(400).json({ error: 'This protected restaurant cannot be archived.' });
  const records = (db.db.platform_applications || []).filter(item => item.tenant_slug_created === slug);
  if (!records.length) return res.status(404).json({ error: 'Restaurant not found.' });
  const tenantTables = ['users','locations','categories','menu_items','orders','order_events','notifications','riders','inventory','coupons','refunds','audit_logs','payment_reconciliations','customer_profiles'];
  for (const table of tenantTables) db.db[table] = (db.db[table] || []).filter(row => row.tenant_slug !== slug);
  db.db.platform_applications = (db.db.platform_applications || []).filter(item => item.tenant_slug_created !== slug);
  db.db.platform_deleted_tenants = db.db.platform_deleted_tenants || [];
  if (!db.db.platform_deleted_tenants.some(item => item.slug === slug)) db.db.platform_deleted_tenants.push({ slug, deleted_at: new Date().toISOString() });
  await db.saveDatabase();
  res.json({ success: true, slug, deleted: true });
});

const requireTeamManager = (req, res) => {
  if (!['admin', 'super_admin'].includes(req.authRole)) {
    res.status(403).json({ error: 'Restaurant administrator permission required' });
    return false;
  }
  return true;
};
app.get('/api/platform/analytics', (req, res) => {
  const rows = (db.db.users || []).filter(user => user.tenant_slug && user.tenant_slug !== 'platform');
  const slugs = [...new Set(rows.map(user => user.tenant_slug))];
  const now = new Date();
  const tenants = slugs.map(slug => {
    const owner = rows.find(user => user.tenant_slug === slug && ['admin', 'super_admin'].includes(user.role));
    const orders = (db.db.orders || []).filter(order => order.tenant_slug === slug);
    const monthOrders = orders.filter(order => { const date = new Date(order.created_at || 0); return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); });
    const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount || order.total || 0), 0);
    return { name: slug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()), slug, owner: owner?.name || 'No owner assigned', revenue, orders: monthOrders.length, verified: Boolean(owner) };
  });
  const activity = (db.db.audit_logs || []).filter(item => item.tenant_slug && item.tenant_slug !== 'platform').sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 8).map(item => ({ action: item.action, entity: item.entity, tenant_slug: item.tenant_slug, actor_name: item.actor_name || 'Platform Admin', created_at: item.created_at }));
  const applications = [...(db.db.platform_applications || [])];
  const removedTenantSlugs = new Set((db.db.platform_deleted_tenants || []).map(item => item.slug));
  for (const slug of slugs.filter(item => !removedTenantSlugs.has(item))) {
    const owner = rows.find(user => user.tenant_slug === slug && ['admin', 'super_admin'].includes(user.role));
    if (!applications.some(item => item.tenant_slug_created === slug)) {
      const ownerApplication = db.insertCollection('platform_applications', { name: owner?.name || slug.replace(/-/g, ' '), email: owner?.email || '', restaurant: slug, phone: owner?.phone || '', status: owner ? 'active' : 'pending', tenant_slug_created: slug, source: owner ? 'tenant_owner' : 'tenant_record' });
      applications.push(ownerApplication);
    }
  }
  applications.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  res.json({ tenants, activeRestaurants: tenants.length, mrr: tenants.filter(tenant => tenant.verified).length * 100, orders: tenants.reduce((sum, tenant) => sum + tenant.orders, 0), activity, applications });
});
app.get('/api/staff', authenticateToken, (req, res) => { if (!requireTeamManager(req, res)) return; const users = req.query.include_customers === '1' ? db.getUsers().filter(user => !user.archived_at) : db.getStaffUsers(); res.json(users.map(user => ({ id: user.id, name: user.name, email: user.email, role: user.role, role_title: user.role_title || (user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Manager' : user.role === 'customer' ? 'Customer account' : 'Staff'), permissions: user.permissions || ['orders'], task: user.task || '', avatar_url: user.avatar_url }))); });
app.post('/api/staff', authenticateToken, (req, res) => { if (!requireTeamManager(req, res)) return; const { name, email, password, role, role_title, permissions, task, avatar_url } = req.body; if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' }); if (db.getUserByEmail(email)) return res.status(409).json({ error: 'User already exists' }); const user = db.createUser({ name, email, password_hash: password, role: role === 'admin' ? 'admin' : 'staff', role_title: role_title || 'Staff', permissions: Array.isArray(permissions) ? permissions : ['orders'], task, avatar_url }); res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, role_title: user.role_title, permissions: user.permissions, task: user.task, avatar_url: user.avatar_url }); });
app.put('/api/staff/:id/task', authenticateToken, (req, res) => { if (!requireTeamManager(req, res)) return; const user = db.updateUserTask(req.params.id, req.body.task); if (!user) return res.status(404).json({ error: 'User not found' }); res.json({ id: user.id, name: user.name, email: user.email, role: user.role, task: user.task }); });
app.put('/api/staff/:id/access', authenticateToken, (req, res) => { if (!requireTeamManager(req, res)) return; const user = db.getUserById(req.params.id); if (!user) return res.status(404).json({ error: 'User not found' }); if (['admin', 'staff', 'customer'].includes(req.body.role)) user.role = req.body.role; user.role_title = String(req.body.role_title || user.role_title || (user.role === 'customer' ? 'Customer account' : 'Staff')); user.permissions = Array.isArray(req.body.permissions) ? req.body.permissions : (user.permissions || ['orders']); db.saveDatabase(); res.json({ id: user.id, name: user.name, email: user.email, role: user.role, role_title: user.role_title, permissions: user.permissions, task: user.task || '', avatar_url: user.avatar_url }); });
app.get('/api/staff/archived', authenticateToken, (req, res) => { if (!requireTeamManager(req, res)) return; res.json(db.getArchivedStaffUsers()); });
app.delete('/api/staff/:id', authenticateToken, (req, res) => { if (!requireTeamManager(req, res)) return; const user = db.getUserById(req.params.id); if (!user || !['customer', 'admin', 'staff'].includes(user.role) || (user.role === 'admin' && req.authRole !== 'super_admin')) return res.status(404).json({ error: 'Team member cannot be deleted' }); user.archived_at = new Date().toISOString(); user.blocked = true; db.saveDatabase(); res.json({ success: true, id: user.id }); });
app.delete('/api/staff/:id/permanent', authenticateToken, (req, res) => { if (!requireTeamManager(req, res)) return; const index = db.users.findIndex(user => user.id === Number(req.params.id) && ['admin', 'staff'].includes(user.role)); if (index === -1) return res.status(404).json({ error: 'Team member not found' }); db.users.splice(index, 1); db.saveDatabase(); res.json({ success: true, id: Number(req.params.id) }); });
app.put('/api/staff/:id/reactivate', authenticateToken, (req, res) => { if (!requireTeamManager(req, res)) return; const user = db.getUserById(req.params.id); if (!user) return res.status(404).json({ error: 'Team member not found' }); delete user.archived_at; user.blocked = false; db.saveDatabase(); res.json(user); });

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
  return { id: user.id, name: user.name, email: user.email, role: user.role, role_title: user.role === 'super_admin' ? 'Super Admin' : (user.role_title || ''), permissions: user.role === 'admin' || user.role === 'super_admin' ? ['*'] : (user.permissions || ['orders']), avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`, phone: user.phone, address: user.address, tenant_slug: user.tenant_slug || 'nomnosh', blocked: Boolean(user.blocked), blocked_reason: user.blocked_reason || '' };
}
const isAdminRole = (role) => role === 'admin' || role === 'super_admin';

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = req.cookies.nomnosh_session || (authHeader && authHeader.split(' ')[1]);
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    const account = db.getUserById(decoded.id);
    if (!account) return res.status(401).json({ error: 'Account no longer exists' });
    if (account.blocked) return res.status(403).json({ error: `Account blocked${account.blocked_reason ? `: ${account.blocked_reason}` : ''}` });
    req.user = decoded;
    req.authRole = account.role;
    req.authId = account.id;
    // Team-management endpoints are available to admins, but the super-admin
    // account remains excluded from the staff collection and cannot be edited.
    if (account.role === 'admin' && req.originalUrl.startsWith('/api/staff')) req.user.role = 'super_admin';
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
  const { email, username, password } = req.body;
  const identifier = String(username || email || '').trim();
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  // Login may begin from the home restaurant route. Find the account globally
  // so a tenant customer can still sign in, then the client switches to the
  // account's own restaurant workspace.
  const user = db.getUserByEmail(identifier) || db.db.users.find(account => String(account.email || '').toLowerCase() === identifier.toLowerCase());
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (user.tenant_slug && user.tenant_slug !== 'platform' && user.role === 'super_admin') {
    const application = (db.db.platform_applications || []).find(item => item.email.toLowerCase() === user.email.toLowerCase() && item.tenant_slug_created === user.tenant_slug);
    if (application && !['active', 'paid', 'trial'].includes(application.status)) {
      return res.status(403).json({ error: 'Your restaurant application is still pending Solutions admin approval.' });
    }
  }

  setSessionCookie(res, user);
  res.json({ user: { ...publicUser(user), tenant_slug: user.tenant_slug || 'nomnosh' } });
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

function deliveryInfo(latitude, longitude) {
  if (!Number.isFinite(STORE_LATITUDE) || !Number.isFinite(STORE_LONGITUDE)) return { deliveryAvailable: null, etaMinutes: null, distanceKm: null };
  const distanceKm = distanceInKm(STORE_LATITUDE, STORE_LONGITUDE, latitude, longitude);
  return { deliveryAvailable: distanceKm <= Number(process.env.DELIVERY_RADIUS_KM || 15), etaMinutes: Math.max(25, Math.round(25 + distanceKm * 3)), distanceKm: Number(distanceKm.toFixed(2)) };
}

async function reverseGeocode(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    const error = new Error('Valid latitude and longitude are required');
    error.statusCode = 400;
    throw error;
  }
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`, {
      headers: { 'User-Agent': GEOCODER_USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    if (response.ok) {
      const data = await response.json();
      if (data?.display_name) return normalizePlace(data, lat, lng);
    }
  } catch {}

  try {
    const fallback = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&localityLanguage=en`, { signal: AbortSignal.timeout(10000) });
  if (!fallback.ok) throw new Error('Address service unavailable');
  const data = await fallback.json();
  const parts = [data.locality, data.city, data.principalSubdivision, data.countryName].filter(Boolean);
  if (!parts.length) throw new Error('Address not found');
  return { formattedAddress: parts.join(', '), address: parts.join(', '), latitude: lat, longitude: lng, city: data.city || data.locality || '', stateOrProvince: data.principalSubdivision || '', country: data.countryName || '', postalCode: data.postcode || '', addressComponents: data.localityInfo || {} };
  } catch {
    if (lat >= 31.2 && lat <= 31.7 && lng >= 74.0 && lng <= 74.7) return { address: 'Lahore, Punjab, Pakistan', latitude: lat, longitude: lng };
    // Geolocation should still be usable when a reverse-geocoder is unavailable.
    // The exact coordinates are retained so delivery distance and map selection work.
    const coordinateAddress = `Current location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    return { formattedAddress: coordinateAddress, address: coordinateAddress, latitude: lat, longitude: lng, city: '', stateOrProvince: '', country: '', postalCode: '', addressComponents: {} };
  }
}

function normalizePlace(item, latitude = Number(item.lat), longitude = Number(item.lon)) {
  const address = item.address || {};
  const city = address.city || address.town || address.village || address.municipality || address.county || '';
  return {
    formattedAddress: item.display_name || item.address || '', address: item.display_name || item.address || '',
    placeName: item.name || (item.display_name || '').split(',')[0], latitude, longitude,
    country: address.country || '', city, stateOrProvince: address.state || address.region || '', postalCode: address.postcode || '',
    addressComponents: address, placeId: item.place_id ? `osm:${item.osm_type || 'place'}:${item.osm_id || item.place_id}` : `coordinates:${latitude},${longitude}`
  };
}

async function googlePlacesSearch(query) {
  if (!GOOGLE_MAPS_API_KEY) return [];
  const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${query}, ${LOCATION_SCOPE}`)}&language=en&region=pk&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Google Places search failed');
  const data = await response.json();
  if (!['OK', 'ZERO_RESULTS'].includes(data.status)) throw new Error(data.error_message || 'Google Places search failed');
  return (data.results || []).map((place) => ({
    formattedAddress: place.formatted_address || place.name,
    address: place.formatted_address || place.name,
    placeName: place.name,
    latitude: Number(place.geometry?.location?.lat), longitude: Number(place.geometry?.location?.lng),
    city: '', stateOrProvince: '', country: '', postalCode: '', addressComponents: {},
    placeId: `google:${place.place_id}`
  })).filter(place => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));
}

function allowedLocation(place) {
  const text = `${place.formattedAddress || ''} ${place.address || ''} ${place.country || ''} ${place.stateOrProvince || ''}`.toLowerCase();
  return text.includes('pakistan') && (text.includes('punjab') || text.includes('lahore') || text.includes('sahiwal'));
}

app.get('/api/geocode', async (req, res) => {
  try {
    const result = await reverseGeocode(req.query.lat, req.query.lng);
    res.json({
      ...result,
      ...deliveryInfo(result.latitude, result.longitude)
    });
  } catch (error) {
    res.status(error.statusCode || 502).json({ error: 'Unable to load the address' });
  }
});

app.get('/api/geocode/search', async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (query.length < 2) return res.json({ results: [] });
  let results = [];
  let providerFailed = false;
  try {
    results = (await googlePlacesSearch(query)).filter(allowedLocation);
  } catch { providerFailed = true; }
  try {
    if (results.length) return res.json({ results: results.map(result => ({ ...result, ...deliveryInfo(result.latitude, result.longitude) })) });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=pk&viewbox=69.0,37.5,74.5,27.5&bounded=1&q=${encodeURIComponent(`${query}, ${LOCATION_SCOPE}`)}`, {
      headers: { 'User-Agent': GEOCODER_USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(8000)
    });
    if (response.ok) {
      const raw = await response.json();
      results = raw.map(item => normalizePlace(item)).filter(allowedLocation);
    } else providerFailed = true;
  } catch { providerFailed = true; }

  if (!results.length) {
    try {
      const response = await fetch(`https://photon.komoot.io/api/?limit=6&q=${encodeURIComponent(`${query}, ${LOCATION_SCOPE}`)}`, {
        headers: { 'User-Agent': GEOCODER_USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(8000)
      });
      if (response.ok) {
        const data = await response.json();
        results = (data.features || []).map((feature) => {
          const props = feature.properties || {};
          const [longitude, latitude] = feature.geometry.coordinates;
          return {
            formattedAddress: [props.name, props.street, props.housenumber, props.city || props.county, props.state, props.country, props.postcode].filter(Boolean).join(', '),
            placeName: props.name || props.street || props.city || props.country || query,
            latitude, longitude, city: props.city || props.county || '',
            stateOrProvince: props.state || '', country: props.country || '', postalCode: props.postcode || '',
            placeId: `photon:${props.osm_type || 'place'}:${props.osm_id || `${latitude},${longitude}`}`
          };
        }).filter(allowedLocation);
      }
    } catch { providerFailed = true; }
  }

  results = results.map(result => ({ ...result, ...deliveryInfo(result.latitude, result.longitude) }));
  if (!results.length && providerFailed) return res.status(502).json({ error: 'The address search service is temporarily unavailable.' });
  res.json({ results });
});

// Resolve browser coordinates (or a manually entered address) server-side.
app.post('/api/location/resolve', async (req, res) => {
  const { latitude, longitude, address } = req.body || {};
  const hasCoordinates = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
  if (!hasCoordinates && !address?.trim()) return res.status(400).json({ error: 'Coordinates or an address is required' });

  try {
    let result;
    if (hasCoordinates) {
      result = await reverseGeocode(latitude, longitude);
    } else {
      result = null;
    }
    if (!Number.isFinite(Number(result?.latitude)) || !Number.isFinite(Number(result?.longitude))) return res.status(404).json({ error: 'Unable to find a readable address for that location' });

    const resolvedLatitude = Number(result.latitude);
    const resolvedLongitude = Number(result.longitude);
    res.json({
      ...result, address: result.formattedAddress || result.address,
      latitude: resolvedLatitude,
      longitude: resolvedLongitude,
      ...deliveryInfo(resolvedLatitude, resolvedLongitude)
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
app.post('/api/categories', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) return res.status(403).json({ error: 'Admin permission required' });
  const category = db.addCategory(req.body); if (!category) return res.status(400).json({ error: 'Category name is required' }); res.status(201).json(category);
});
app.put('/api/categories/:id', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) return res.status(403).json({ error: 'Admin permission required' });
  const category = db.updateCategory(req.params.id, req.body); if (!category) return res.status(404).json({ error: 'Category not found' }); res.json(category);
});
app.delete('/api/categories/:id', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) return res.status(403).json({ error: 'Admin permission required' });
  if (!db.deleteCategory(req.params.id)) return res.status(404).json({ error: 'Category not found' }); res.json({ success: true });
});

app.get('/api/locations', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) return res.status(403).json({ error: 'Admin permission required' });
  res.json(db.getLocations());
});
app.post('/api/locations', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) return res.status(403).json({ error: 'Admin permission required' });
  const { name, latitude, longitude } = req.body;
  if (!name || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
  res.status(201).json(db.addLocation(req.body));
});
app.put('/api/locations/:id', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) return res.status(403).json({ error: 'Admin permission required' });
  const location = db.updateLocation(req.params.id, req.body); if (!location) return res.status(404).json({ error: 'Location not found' }); res.json(location);
});
app.delete('/api/locations/:id', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) return res.status(403).json({ error: 'Admin permission required' });
  if (!db.deleteLocation(req.params.id)) return res.status(404).json({ error: 'Location not found' }); res.json({ success: true });
});

// Menu Items (with category & search)
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  const items = db.getMenuItems(category, search).filter(item => req.query.include_unavailable === '1' || item.is_available !== false);
  res.json(items);
});

// Add Menu Item (Admin)
app.post('/api/products', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  const item = db.addMenuItem(req.body);
  res.status(201).json(item);
});

// Update Menu Item (Admin)
app.put('/api/products/:id', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  const updated = db.updateMenuItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json(updated);
});

// Delete Menu Item (Admin)
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) {
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
  if (req.user && isAdminRole(req.user.role)) {
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
  if (orderData.order_type === 'delivery' && (!Number.isFinite(Number(orderData.latitude)) || !Number.isFinite(Number(orderData.longitude)))) {
    return res.status(400).json({ error: 'Please select and confirm a delivery location before ordering' });
  }

  if (req.user) {
    orderData.user_id = req.user.id;
    if (!orderData.customer_email) orderData.customer_email = req.user.email;
  }

  const createdOrder = db.createOrder(orderData);
  db.insertCollection('notifications', { type: 'new_order', title: 'New order received', message: `Order #${createdOrder.id} from ${createdOrder.customer_name}`, order_id: createdOrder.id, read_at: null });
  res.status(201).json(createdOrder);
});

// Update Order Status (Admin)
app.put('/api/orders/:id/status', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  const { status } = req.body;
  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

// ----------------- OPERATIONS WORKSPACE ----------------- //
const requireAdmin = (req, res, next) => isAdminRole(req.user.role) ? next() : res.status(403).json({ error: 'Admin permission required' });
const audit = (req, action, entity, entity_id, details = {}) => db.insertCollection('audit_logs', { actor_id: req.user.id, actor_name: req.user.name, action, entity, entity_id, details });

app.get('/api/orders/:id/detail', authenticateToken, requireAdmin, (req, res) => {
  const order = db.getOrderById(req.params.id); if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ ...order, timeline: db.getCollection('order_events').filter(e => e.order_id === order.id) });
});
app.put('/api/orders/:id/assignment', authenticateToken, requireAdmin, (req, res) => {
  const order = db.getOrderById(req.params.id); if (!order) return res.status(404).json({ error: 'Order not found' });
  Object.assign(order, { rider_id: req.body.rider_id || null, preparation_minutes: Number(req.body.preparation_minutes || 0), customer_notes: req.body.customer_notes || order.notes });
  db.saveDatabase(); audit(req, 'updated', 'order', order.id, req.body); res.json(order);
});
app.get('/api/notifications', authenticateToken, requireAdmin, (req, res) => res.json(db.getCollection('notifications').slice(0, 100)));
app.post('/api/notifications/:id/read', authenticateToken, requireAdmin, (req, res) => res.json(db.updateCollection('notifications', req.params.id, { read_at: new Date().toISOString() }) || {}));
app.get('/api/riders', authenticateToken, requireAdmin, (req, res) => res.json(db.getCollection('riders')));
app.post('/api/riders', authenticateToken, requireAdmin, (req, res) => { const rider = db.insertCollection('riders', { name: req.body.name, phone: req.body.phone, status: 'available', zone: req.body.zone || '' }); audit(req, 'created', 'rider', rider.id, rider); res.status(201).json(rider); });
app.put('/api/riders/:id', authenticateToken, requireAdmin, (req, res) => res.json(db.updateCollection('riders', req.params.id, req.body) || {}));
app.get('/api/inventory', authenticateToken, requireAdmin, (req, res) => res.json(db.getCollection('inventory')));
app.post('/api/inventory', authenticateToken, requireAdmin, (req, res) => { const item = db.insertCollection('inventory', { name: req.body.name, unit: req.body.unit || 'unit', stock: Number(req.body.stock || 0), low_stock_threshold: Number(req.body.low_stock_threshold || 5), menu_item_ids: req.body.menu_item_ids || [] }); audit(req, 'created', 'inventory', item.id, item); res.status(201).json(item); });
app.put('/api/inventory/:id', authenticateToken, requireAdmin, (req, res) => res.json(db.updateCollection('inventory', req.params.id, req.body) || {}));
app.get('/api/analytics', authenticateToken, requireAdmin, (req, res) => { const orders = db.getOrders(); const completed = orders.filter(o => o.status === 'delivered'); const byDay = {}; completed.forEach(o => { const day = String(o.created_at || '').slice(0, 10); byDay[day] = (byDay[day] || 0) + Number(o.total_amount || 0); }); res.json({ revenue: completed.reduce((s, o) => s + Number(o.total_amount || 0), 0), orders: orders.length, average_order: completed.length ? completed.reduce((s, o) => s + Number(o.total_amount || 0), 0) / completed.length : 0, byDay }); });
app.get('/api/customers', authenticateToken, requireAdmin, (req, res) => { const orders = db.getOrders(); const grouped = {}; orders.forEach(o => { const key = o.customer_email || o.customer_phone || o.customer_name; const account = db.getUsers().find(u => u.email && u.email === o.customer_email); grouped[key] = { name: o.customer_name, email: o.customer_email, phone: o.customer_phone, address: o.delivery_address, account_id: account?.id || null, avatar_url: account?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(o.customer_name)}`, blocked: Boolean(account?.blocked), blocked_at: account?.blocked_at || null, orders: (grouped[key]?.orders || 0) + 1, spent: (grouped[key]?.spent || 0) + Number(o.total_amount || 0), order_history: [...(grouped[key]?.order_history || []), o] }; }); const profiles = db.getCollection('customer_profiles'); profiles.forEach(p => { const key = p.email || p.phone || p.name; grouped[key] = { ...p, ...(grouped[key] || {}), avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.name)}`, order_history: grouped[key]?.order_history || [] }; }); let result = Object.values(grouped); if (req.query.condition === 'frequent') result = result.filter(c => c.orders >= 3).sort((a, b) => b.orders - a.orders); if (['top_spenders','high_value'].includes(req.query.condition)) result = result.sort((a, b) => b.spent - a.spent).slice(0, 10); if (req.query.condition === 'low_spenders') result = result.sort((a, b) => a.spent - b.spent).slice(0, 10); if (req.query.condition === 'blocked') result = result.filter(c => c.blocked).sort((a, b) => new Date(b.blocked_at || 0) - new Date(a.blocked_at || 0)); if (req.query.condition === 'active') result = result.filter(c => !c.blocked); if (req.query.condition === 'new') result = result.filter(c => c.orders <= 1); res.json(result); });
app.post('/api/customers', authenticateToken, requireAdmin, (req, res) => { const { name, email, password, phone, address, notes, loyalty_points } = req.body; if (!name || !phone || !email || !password) return res.status(400).json({ error: 'Name, email, phone, and password are required' }); if (db.getUserByEmail(email)) return res.status(409).json({ error: 'A customer with this email already exists' }); const user = db.createUser({ name, email, password_hash: password, role: 'customer', phone, address }); const customer = db.insertCollection('customer_profiles', { user_id: user.id, name, email, phone, address: address || '', notes: notes || '', loyalty_points: Number(loyalty_points || 0), orders: 0, spent: 0, avatar_url: user.avatar_url }); audit(req, 'created', 'customer', user.id, customer); res.status(201).json({ ...customer, account_id: user.id, avatar_url: user.avatar_url }); });
app.get('/api/customers/detail', authenticateToken, requireAdmin, (req, res) => { const key = String(req.query.email || req.query.phone || '').toLowerCase(); const user = db.getUsers().find(u => String(u.email || '').toLowerCase() === key || String(u.phone || '').toLowerCase() === key); if (user) { const orders = db.getOrders().filter(o => o.user_id === user.id || String(o.customer_email || '').toLowerCase() === String(user.email || '').toLowerCase()); return res.json({ ...publicUser(user), orders, order_count: orders.length, total_spent: orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) }); } const profile = db.getCollection('customer_profiles').find(p => String(p.email || '').toLowerCase() === key || String(p.phone || '').toLowerCase() === key); if (!profile) return res.status(404).json({ error: 'Customer account not found' }); const orders = db.getOrders().filter(o => String(o.customer_email || '').toLowerCase() === String(profile.email || '').toLowerCase() || String(o.customer_phone || '') === String(profile.phone || '')); res.json({ id: profile.id, name: profile.name, email: profile.email, phone: profile.phone, address: profile.address, notes: profile.notes, avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`, blocked: false, orders, order_count: orders.length, total_spent: orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0), profile_only: true }); });
app.put('/api/customers/:id/block', authenticateToken, requireAdmin, (req, res) => { const user = db.getUserById(req.params.id); if (user && user.role === 'customer') { user.blocked = Boolean(req.body.blocked); user.blocked_reason = user.blocked ? String(req.body.reason || 'Blocked by restaurant staff') : ''; user.blocked_at = user.blocked ? new Date().toISOString() : null; db.saveDatabase(); audit(req, user.blocked ? 'blocked' : 'unblocked', 'customer', user.id, { reason: user.blocked_reason }); return res.json(publicUser(user)); } const profile = db.getCollection('customer_profiles').find(p => String(p.id) === String(req.params.id)); if (!profile) return res.status(404).json({ error: 'Customer account not found' }); profile.blocked = Boolean(req.body.blocked); profile.blocked_reason = profile.blocked ? String(req.body.reason || 'Blocked by restaurant staff') : ''; profile.blocked_at = profile.blocked ? new Date().toISOString() : null; db.saveDatabase(); audit(req, profile.blocked ? 'blocked' : 'unblocked', 'customer', profile.id, { reason: profile.blocked_reason }); res.json({ ...profile, avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}` }); });
app.delete('/api/customers/:id', authenticateToken, requireAdmin, (req, res) => { const user = db.getUserById(req.params.id); if (user && user.role === 'customer') { user.deleted_at = new Date().toISOString(); user.blocked = true; user.blocked_reason = 'Deleted by restaurant staff'; db.saveDatabase(); audit(req, 'deleted', 'customer', user.id); return res.json({ success: true }); } const profile = db.getCollection('customer_profiles').find(p => String(p.id) === String(req.params.id)); if (!profile) return res.status(404).json({ error: 'Customer account not found' }); profile.deleted_at = new Date().toISOString(); db.saveDatabase(); audit(req, 'deleted', 'customer', profile.id); res.json({ success: true }); });
app.get('/api/coupons', authenticateToken, requireAdmin, (req, res) => res.json(db.getCollection('coupons')));
app.post('/api/coupons', authenticateToken, requireAdmin, (req, res) => { const coupon = db.insertCollection('coupons', { code: String(req.body.code || '').toUpperCase(), type: req.body.type || 'fixed', value: Number(req.body.value || 0), minimum_order: Number(req.body.minimum_order || 0), usage_limit: Number(req.body.usage_limit || 0), active: req.body.active !== false }); audit(req, 'created', 'coupon', coupon.id, coupon); res.status(201).json(coupon); });
app.get('/api/refunds', authenticateToken, requireAdmin, (req, res) => res.json(db.getCollection('refunds')));
app.post('/api/refunds', authenticateToken, requireAdmin, (req, res) => { const refund = db.insertCollection('refunds', { order_id: req.body.order_id, amount: Number(req.body.amount || 0), reason: req.body.reason || '', status: 'processed', processed_by: req.user.id }); audit(req, 'created', 'refund', refund.id, refund); res.status(201).json(refund); });
app.get('/api/audit-logs', authenticateToken, requireAdmin, (req, res) => res.json(db.getCollection('audit_logs').slice(0, 200)));

// ----------------- DASHBOARD ANALYTICS ----------------- //

app.get('/api/stats', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) {
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
  if (!isAdminRole(req.user.role)) {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  res.json(db.getSchema());
});

app.post('/api/mysql/query', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'SQL query string required' });
  const result = db.executeSql(sql);
  res.json(result);
});

app.post('/api/mysql/reset', authenticateToken, (req, res) => {
  if (!isAdminRole(req.user.role)) {
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

