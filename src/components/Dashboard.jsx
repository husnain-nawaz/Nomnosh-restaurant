import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingCart, Clock, CheckCircle, Plus, Edit2, Trash2,
  Database, RefreshCw, Terminal, Eye, Play, AlertCircle, ArrowLeft, MapPin, Search, PanelLeftClose, PanelLeftOpen, Users,
  ChefHat, Truck, Package, BarChart3, UserRound, Tag, Receipt, ShieldCheck, Bell
} from 'lucide-react';

const compressMenuImage = (file) => new Promise(resolve => {
  const reader = new FileReader();
  reader.onload = () => { const image = new Image(); image.onload = () => { const scale = Math.min(1, 1200 / Math.max(image.width, image.height)); const canvas = document.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', 0.72)); }; image.src = String(reader.result); };
  reader.onerror = () => resolve(null); reader.readAsDataURL(file);
});

export default function Dashboard({ onReturnToStore, currentUser }) {
  useEffect(() => { const replaceCorruptedCloseMarks = () => { const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const nodes = []; let node; while ((node = walker.nextNode())) nodes.push(node); nodes.forEach(textNode => { if (textNode.nodeValue?.includes('âœ•') || textNode.nodeValue?.includes('Ã—')) textNode.nodeValue = textNode.nodeValue.replaceAll('âœ•', '✕').replaceAll('Ã—', '✕'); }); }; replaceCorruptedCloseMarks(); const observer = new MutationObserver(replaceCorruptedCloseMarks); observer.observe(document.body, { childList: true, subtree: true }); return () => observer.disconnect(); }, []);
  const teamManager = false;
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('nomnosh_dashboard_tab') || 'orders'); // 'orders' | 'menu' | 'locations' | 'mysql'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [staff, setStaff] = useState([]);
  const [archivedStaff, setArchivedStaff] = useState([]);
  const dashboardTabs = [['orders', 'Orders'], ['kitchen', 'Kitchen Display'], ['riders', 'Delivery'], ['inventory', 'Inventory'], ['analytics', 'Sales Analytics'], ['customers', 'Customers'], ['promos', 'Promotions'], ['finance', 'Finance & Refunds'], ['audit', 'Audit Logs'], ['menu', 'Menu Catalog'], ['categories', 'Categories'], ['locations', 'Restaurant Locations'], ['mysql', 'MySQL Console']];
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'staff', role_title: 'Kitchen Team', permissions: ['orders'], task: '', avatar_url: '' });
  const [editingStaff, setEditingStaff] = useState(null);
  const [archiveCandidate, setArchiveCandidate] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryModal, setCategoryModal] = useState(null);
  const [categoryEditName, setCategoryEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => { sessionStorage.setItem('nomnosh_dashboard_tab', activeTab); }, [activeTab]);

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailPage, setOrderDetailPage] = useState(false);

  // New Menu Item Form Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('regular-pizza-flavors');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCuisine, setNewItemCuisine] = useState('');
  const [newItemImages, setNewItemImages] = useState(['']);
  const [previewImage, setPreviewImage] = useState(null);
  const [newItemIsDeal, setNewItemIsDeal] = useState(false);
  const [newItemAvailable, setNewItemAvailable] = useState(true);
  const [newItemSizes, setNewItemSizes] = useState('');
  const [newItemSizeVariants, setNewItemSizeVariants] = useState([{ enabled: true, name: 'Small', priceDelta: 0 }, { enabled: false, name: 'Medium', priceDelta: 550 }, { enabled: false, name: 'Large', priceDelta: 1100 }, { enabled: false, name: 'Extra Large', priceDelta: 1600 }]);
  const [newItemOptions, setNewItemOptions] = useState([]);
  const standardPizzaOptions = [{ name: 'Choose Crust Type', type: 'single', options: [{ name: 'Original Pan Crust', price: 0 }, { name: 'Crispy Thin Crust', price: 0 }, { name: 'Cheesy Stuffed Crust', price: 250 }, { name: 'Regal Crown Crust', price: 300 }] }, { name: 'Spice Level', type: 'single', options: [{ name: 'Mild', price: 0 }, { name: 'Normal', price: 0 }, { name: 'Extra Spicy ðŸ”¥', price: 0 }] }, { name: 'Extra Toppings & Sauces (Optional)', type: 'multiple', options: [{ name: 'Extra Mozzarella Cheese', price: 150 }, { name: 'Pickled JalapeÃ±os', price: 80 }, { name: 'Fresh Sliced Mushrooms', price: 100 }, { name: 'Signature Garlic Mayo Dip', price: 60 }] }, { name: 'Cooking or Delivery Notes', type: 'notes', options: [{ name: 'Special instructions', price: 0 }] }];
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productEdit, setProductEdit] = useState(null);
  useEffect(() => { if (!editingProduct) return; const saved = Array.isArray(editingProduct.sizes_json) ? editingProduct.sizes_json : []; setNewItemSizeVariants([{ enabled: saved.length ? Boolean(saved[0]) : true, name: typeof saved[0] === 'object' ? saved[0].name : (saved[0] || 'Small'), priceDelta: typeof saved[0] === 'object' ? Number(saved[0].priceDelta || 0) : 0 }, { enabled: Boolean(saved[1]), name: typeof saved[1] === 'object' ? saved[1].name : (saved[1] || 'Medium'), priceDelta: typeof saved[1] === 'object' ? Number(saved[1].priceDelta || 0) : 550 }, { enabled: Boolean(saved[2]), name: typeof saved[2] === 'object' ? saved[2].name : (saved[2] || 'Large'), priceDelta: typeof saved[2] === 'object' ? Number(saved[2].priceDelta || 0) : 1100 }, { enabled: Boolean(saved[3]), name: typeof saved[3] === 'object' ? saved[3].name : (saved[3] || 'Extra Large'), priceDelta: typeof saved[3] === 'object' ? Number(saved[3].priceDelta || 0) : 1600 }]); }, [editingProduct]);

  // MySQL Console States
  const [sqlQuery, setSqlQuery] = useState("SELECT id, customer_name, total_amount, status FROM orders LIMIT 10;");
  const [sqlResult, setSqlResult] = useState(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [mysqlSchemas, setMysqlSchemas] = useState([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [restaurantLocations, setRestaurantLocations] = useState([]);
  const [operationsData, setOperationsData] = useState({});
  const [operationSearch, setOperationSearch] = useState('');
  const [operationFilter, setOperationFilter] = useState('all');
  const [customerDetail, setCustomerDetail] = useState(null);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [customerOrderPage, setCustomerOrderPage] = useState(1);
  const [deleteCustomerTarget, setDeleteCustomerTarget] = useState(null);
  const [blockReasonOpen, setBlockReasonOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [customerActionError, setCustomerActionError] = useState('');
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [promotionFormOpen, setPromotionFormOpen] = useState(false);
  const [promotionForm, setPromotionForm] = useState({ code: '', type: 'fixed', value: '', minimum_order: '', usage_limit: '' });
  const [refundFormOpen, setRefundFormOpen] = useState(false);
  const [refundForm, setRefundForm] = useState({ order_id: '', amount: '', reason: '', payment_method: 'cash_on_delivery', collection_status: 'pending' });
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', password: '', address: '', notes: '' });
  const [customerPage, setCustomerPage] = useState(1);
  const [newLocation, setNewLocation] = useState({ name: '', address: '', city: '', phone: '', latitude: '', longitude: '' });

  const addCategory = async event => { event.preventDefault(); if (!newCategoryName.trim()) return; const response = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name: newCategoryName }) }); if (response.ok) { const created = await response.json(); setCategories([...categories, created]); setNewCategoryName(''); setNewItemCategory(created.slug); setActiveTab('menu'); setIsAddModalOpen(true); } };
  const editCategory = async () => { if (!categoryModal?.category || !categoryEditName.trim()) return; const response = await fetch(`/api/categories/${categoryModal.category.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name: categoryEditName.trim(), banner_title: categoryEditName.trim() }) }); if (response.ok) { const updated = await response.json(); setCategories(categories.map(item => item.id === updated.id ? updated : item)); setCategoryModal(null); } };
  const removeCategory = async () => { if (!categoryModal?.category) return; const response = await fetch(`/api/categories/${categoryModal.category.id}`, { method: 'DELETE', credentials: 'include' }); if (response.ok) { setCategories(categories.filter(item => item.id !== categoryModal.category.id)); setCategoryModal(null); } };

  const searchLocations = async (event) => {
    event.preventDefault();
    const query = locationQuery.trim();
    if (query.length < 2) { setLocationResults([]); setLocationError('Enter at least 2 characters.'); return; }
    setLocationLoading(true); setLocationError('');
    try {
      const response = await fetch(`/api/geocode/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Location search failed');
      setLocationResults(Array.isArray(data.results) ? data.results : []);
      if (!data.results?.length) setLocationError('No matching Punjab locations found.');
    } catch (error) { setLocationResults([]); setLocationError(error.message); }
    finally { setLocationLoading(false); }
  };

  // Fetch initial dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = {};

      const [statsRes, ordersRes, menuRes, catRes, schemaRes] = await Promise.all([
        fetch('/api/stats', { headers, credentials: 'include' }),
        fetch('/api/orders', { headers, credentials: 'include' }),
        fetch('/api/products?include_unavailable=1'),
        fetch('/api/categories'),
        fetch('/api/mysql/schema', { headers, credentials: 'include' })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (menuRes.ok) setMenuItems(await menuRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (schemaRes.ok) setMysqlSchemas(await schemaRes.json());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => { if (activeTab === 'locations') fetch('/api/locations', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(setRestaurantLocations); }, [activeTab]);
  useEffect(() => {
    const endpoints = { kitchen: '/api/orders', riders: '/api/riders', inventory: '/api/inventory', analytics: '/api/analytics', customers: '/api/customers', promos: '/api/coupons', finance: '/api/refunds', audit: '/api/audit-logs' };
    if (!endpoints[activeTab]) return;
    const endpoint = activeTab === 'customers' && operationFilter !== 'all' ? `${endpoints[activeTab]}?condition=${operationFilter}` : endpoints[activeTab];
    fetch(endpoint, { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(data => setOperationsData(prev => ({ ...prev, [activeTab]: data }))).catch(() => {});
  }, [activeTab, operationFilter]);
  useEffect(() => { if (activeTab === 'customers') setCustomerPage(1); }, [activeTab, operationSearch, operationFilter]);
  useEffect(() => { if (activeTab !== 'customers') return; const hideRowStatusActions = () => document.querySelectorAll('button').forEach(button => { const label = button.textContent?.trim(); if ((label === 'Block' || label === 'Unblock') && !button.closest('.fixed')) button.style.display = 'none'; }); const timer = window.setTimeout(hideRowStatusActions, 0); return () => window.clearTimeout(timer); }, [activeTab, operationsData.customers]);
  useEffect(() => { if (activeTab !== 'promos') return; const timer = window.setTimeout(() => { document.querySelectorAll('button').forEach(button => { if (button.textContent?.includes('Add promotion') && !button.dataset.promotionBound) { button.dataset.promotionBound = 'true'; button.addEventListener('click', () => setPromotionFormOpen(true)); } }); }, 0); return () => window.clearTimeout(timer); }, [activeTab]);
  useEffect(() => { if (activeTab === 'customers') return; const bindViewButtons = () => document.querySelectorAll('button').forEach(button => { if (button.textContent?.trim() !== 'View' || button.dataset.orderBound) return; let row = button.parentElement; while (row && row !== document.body && !row.textContent?.includes('Order #')) row = row.parentElement; const order = orders.find(item => row?.textContent?.includes(`Order #${item.id}`)); if (!order) return; button.dataset.orderBound = 'true'; button.addEventListener('click', () => setSelectedOrder(order)); }); const timer = window.setTimeout(bindViewButtons, 0); return () => window.clearTimeout(timer); }, [activeTab, orders, operationsData]);
  useEffect(() => { if (activeTab !== 'inventory') return; const bindInventoryButtons = () => document.querySelectorAll('button').forEach(button => { if (button.textContent?.trim() !== 'View' || button.dataset.inventoryBound) return; let row = button.parentElement; while (row && row !== document.body && !row.textContent?.includes('Stock level')) row = row.parentElement; const item = [...(operationsData.inventory || []), ...menuItems.map(menu => ({ ...menu, stock: 24, unit: 'units', low_stock_threshold: 5 }))].find(record => row?.textContent?.includes(record.name)); if (!item) return; button.dataset.inventoryBound = 'true'; button.addEventListener('click', () => setSelectedInventory(item)); }); const timer = window.setTimeout(bindInventoryButtons, 0); return () => window.clearTimeout(timer); }, [activeTab, operationsData.inventory, menuItems]);
  useEffect(() => { if (!customerDetail) return; const modal = [...document.querySelectorAll('.fixed.inset-0')].find(node => node.textContent?.includes(customerDetail.name) && node.textContent?.includes('Order history')); const rows = modal?.querySelectorAll('.divide-y > div'); rows?.forEach((row, index) => { row.style.display = index >= (customerOrderPage - 1) * 5 && index < customerOrderPage * 5 ? '' : 'none'; }); }, [customerDetail, customerOrderPage]);
  useEffect(() => { if (!customerDetail) return; const modal = [...document.querySelectorAll('.fixed.inset-0')].find(node => node.textContent?.includes(customerDetail.name) && node.textContent?.includes('Order history')); const rows = modal?.querySelectorAll('.divide-y > div'); rows?.forEach((row, index) => { if (row.querySelector('[data-order-time]')) return; const order = customerDetail.orders?.[index]; if (!order?.created_at) return; const time = document.createElement('span'); time.dataset.orderTime = 'true'; time.className = 'text-[10px] text-stone-400'; time.textContent = new Date(order.created_at).toLocaleString(); row.appendChild(time); }); }, [customerDetail, customerOrderPage]);
  const createOperationRecord = async () => {
    if (activeTab === 'customers') { setCustomerFormOpen(true); return; }
    if (activeTab === 'promos') { setPromotionFormOpen(true); return; }
    if (activeTab === 'finance') { setRefundFormOpen(true); return; }
    const prompts = { riders: ['rider name', 'phone number'], inventory: ['ingredient name', 'current stock'] };
    const fields = prompts[activeTab];
    if (!fields) return alert('Use the order controls or export tools in this section.');
    const first = window.prompt(`Enter ${fields[0]}`); if (!first) return;
    const second = window.prompt(`Enter ${fields[1]}`); if (!second) return;
    const endpoint = activeTab === 'riders' ? '/api/riders' : activeTab === 'inventory' ? '/api/inventory' : '/api/coupons';
    const body = activeTab === 'riders' ? { name: first, phone: second } : activeTab === 'inventory' ? { name: first, stock: Number(second) || 0 } : { code: first, value: Number(second) || 0 };
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) });
    if (!response.ok) return alert('Unable to save record.');
    const created = await response.json(); setOperationsData(prev => ({ ...prev, [activeTab]: [created, ...(prev[activeTab] || [])] }));
  };
  const submitPromotionForm = async (event) => { event.preventDefault(); const response = await fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ...promotionForm, value: Number(promotionForm.value || 0), minimum_order: Number(promotionForm.minimum_order || 0), usage_limit: Number(promotionForm.usage_limit || 0) }) }); const data = await response.json(); if (!response.ok) return alert(data.error || 'Unable to create promotion.'); setOperationsData(prev => ({ ...prev, promos: [data, ...(prev.promos || [])] })); setPromotionForm({ code: '', type: 'fixed', value: '', minimum_order: '', usage_limit: '' }); setPromotionFormOpen(false); };
  const submitRefundForm = async (event) => { event.preventDefault(); const response = await fetch('/api/refunds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ...refundForm, amount: Number(refundForm.amount || 0) }) }); const data = await response.json(); if (!response.ok) return alert(data.error || 'Unable to save reconciliation record.'); setOperationsData(prev => ({ ...prev, finance: [data, ...(prev.finance || [])] })); setRefundForm({ order_id: '', amount: '', reason: '', payment_method: 'cash_on_delivery', collection_status: 'pending' }); setRefundFormOpen(false); };
  const submitCustomerForm = async (event) => { event.preventDefault(); const response = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(customerForm) }); const data = await response.json(); if (!response.ok) return alert(data.error || 'Unable to create customer account.'); setOperationsData(prev => ({ ...prev, customers: [data, ...(prev.customers || [])] })); setCustomerForm({ name: '', email: '', phone: '', password: '', address: '', notes: '' }); setCustomerFormOpen(false); };
  const openCustomerDetail = () => setCustomerPickerOpen(true);
  const selectCustomerDetail = async (customer) => { const key = customer.email || customer.phone; const response = await fetch(`/api/customers/detail?email=${encodeURIComponent(key)}`, { credentials: 'include' }); const data = await response.json(); if (!response.ok) return alert(data.error || 'Customer account not found'); setCustomerPickerOpen(false); setCustomerDetail(data); };
  const viewCustomer = (customer) => { const matchesCustomer = o => customer.email ? String(o.customer_email || '').toLowerCase() === String(customer.email).toLowerCase() : String(o.customer_phone || '') === String(customer.phone || ''); const fallbackOrders = orders.filter(matchesCustomer); const ownHistory = (customer.order_history || []).filter(matchesCustomer); const history = ownHistory.length ? ownHistory : fallbackOrders; const detail = { ...customer, id: customer.account_id || customer.id, order_count: history.length, total_spent: history.reduce((sum, o) => sum + Number(o.total_amount || 0), 0), orders: history }; setCustomerOrderPage(1); setCustomerDetail(detail); };
  const toggleCustomerBlock = async () => { if (!customerDetail) return; if (!customerDetail.blocked) { setBlockReason(''); setBlockReasonOpen(true); return; } const customerId = customerDetail.account_id || customerDetail.id; const response = await fetch(`/api/customers/${customerId}/block`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ blocked: false }) }); if (!response.ok) return; const updated = await response.json(); setCustomerDetail({ ...customerDetail, ...updated, blocked: false }); setBlockReasonOpen(false); };
  const confirmCustomerBlock = async () => { if (!customerDetail) return; const customerId = customerDetail.account_id || customerDetail.id; if (!customerId) return alert('This customer has no account ID. Refresh the customer list.'); const response = await fetch(`/api/customers/${encodeURIComponent(customerId)}/block`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ blocked: true, reason: blockReason.trim() || 'Spam or policy violation' }) }); if (!response.ok) { const error = await response.json().catch(() => ({})); const message = error.error || `Block request failed (${response.status})`; setCustomerActionError(message); alert(message); return; } const updated = await response.json(); setCustomerDetail({ ...customerDetail, ...updated, blocked: true, blocked_reason: blockReason.trim() || 'Spam or policy violation' }); setCustomerActionError(''); setBlockReasonOpen(false); };
  const toggleCustomerBlockFor = async (customer) => { if (!customer.account_id) return; const blocked = !customer.blocked; const reason = blocked ? (window.prompt('Reason for blocking this customer') || 'Spam or policy violation') : ''; const response = await fetch(`/api/customers/${customer.account_id}/block`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ blocked, reason }) }); if (!response.ok) return alert('Unable to update account status.'); setOperationsData(prev => ({ ...prev, customers: (prev.customers || []).map(c => c.account_id === customer.account_id ? { ...c, blocked } : c) })); };
  const deleteCustomer = async (customer) => { if (!customer.account_id) return setDeleteCustomerTarget(customer); setDeleteCustomerTarget(customer); };
  const confirmDeleteCustomer = async () => { const customer = deleteCustomerTarget; if (!customer) return; const customerId = customer.account_id || customer.id; const response = await fetch(`/api/customers/${customerId}`, { method: 'DELETE', credentials: 'include' }); if (!response.ok) return alert('Unable to delete customer.'); setOperationsData(prev => ({ ...prev, customers: (prev.customers || []).filter(c => (c.account_id || c.id) !== customerId) })); if (customerDetail?.id === customerId) setCustomerDetail(null); setDeleteCustomerTarget(null); };
  useEffect(() => { if (activeTab === 'staff' && ['admin', 'super_admin'].includes(currentUser?.role)) { fetch('/api/staff?include_customers=1', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(setStaff); fetch('/api/staff/archived', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(setArchivedStaff); } }, [activeTab, currentUser]);
  const createStaff = async event => { event.preventDefault(); const response = await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(staffForm) }); const data = await response.json(); if (!response.ok) return alert(data.error || 'Unable to create user'); setStaff([...staff, data]); setStaffForm({ name: '', email: '', password: '', role: 'staff', role_title: 'Kitchen Team', permissions: ['orders'], task: '', avatar_url: '' }); };
  const canAccessTab = tab => currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.permissions?.includes('*') || currentUser?.permissions?.includes(tab);
  useEffect(() => { if (!currentUser) return; if (activeTab !== 'staff' && !canAccessTab(activeTab)) setActiveTab('orders'); }, [currentUser, activeTab]);
  useEffect(() => { if (activeTab !== 'staff') return; const protectedIds = new Set(staff.filter(user => user.role === 'super_admin' || (user.role === 'admin' && currentUser?.role === 'admin') || (user.role === 'staff' && currentUser?.role === 'staff')).map(user => String(user.id))); const cards = [...document.querySelectorAll('p')].filter(node => node.textContent?.trim().startsWith('Task:')).map(node => node.closest('button') || node.closest('.rounded-2xl')).filter(Boolean).filter(card => { const user = staff.find(item => card.textContent?.includes(item.name)); return user && protectedIds.has(String(user.id)); }); cards.forEach(card => { card.style.filter = 'blur(1.5px)'; card.style.pointerEvents = 'none'; card.title = 'Restricted account'; card.setAttribute('aria-label', 'Restricted account'); }); return () => cards.forEach(card => { card.style.filter = ''; card.style.pointerEvents = ''; card.title = ''; card.removeAttribute('aria-label'); }); }, [activeTab, currentUser, staff]);
  useEffect(() => { if (activeTab !== 'staff') return undefined; const handleMemberClick = event => { if (event.target.closest('.fixed.inset-0')) return; let node = event.target; for (let level = 0; node && level < 8; level += 1, node = node.parentElement) { const member = staff.find(user => String(node.textContent || '').includes(user.name)); if (member) { if (['admin', 'super_admin'].includes(member.role)) return; setEditingStaff({ ...member, permissions: member.permissions || ['orders'] }); return; } } }; document.addEventListener('click', handleMemberClick, true); return () => document.removeEventListener('click', handleMemberClick, true); }, [activeTab, staff]);
  useEffect(() => { if (!editingStaff) return undefined; const toggle = event => { const button = event.target.closest('button'); const label = button?.textContent?.trim(); const tab = dashboardTabs.find(([, name]) => name === label)?.[0]; if (!tab || editingStaff.role !== 'admin') return; event.stopPropagation(); const allTabs = dashboardTabs.map(([value]) => value); setEditingStaff({ ...editingStaff, role: 'staff', permissions: allTabs.filter(value => value !== tab) }); }; document.addEventListener('click', toggle, true); return () => document.removeEventListener('click', toggle, true); }, [editingStaff]);
  const assignStaffTask = async (id, task) => { const response = await fetch(`/api/staff/${id}/task`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ task }) }); if (response.ok) { const data = await response.json(); setStaff(staff.map(user => user.id === id ? data : user)); } };
const deleteStaffMember = async member => { if (!window.confirm('Remove this member from this restaurant?')) return; const response = await fetch('/api/staff/' + member.id, { method: 'DELETE', credentials: 'include' }); if (!response.ok) { const data = await response.json().catch(() => ({})); return alert(data.error || 'Unable to remove account.'); } setStaff(current => current.filter(item => item.id !== member.id)); setEditingStaff(null); };
  const saveStaffAccess = async member => { try { const response = await fetch(`/api/staff/${member.id}/access`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ role: member.role, role_title: member.role_title, permissions: member.role === 'admin' ? ['*'] : (member.permissions || ['orders']) }) }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || `Save failed (${response.status})`); setStaff(staff.map(user => user.id === data.id ? data : user)); setEditingStaff(null); } catch (error) { alert(error.message || 'Unable to save team access.'); } };
  const isCurrentAccount = user => String(user?.id) === String(currentUser?.id);
  const isProtectedProfile = user => isCurrentAccount(user) || ['admin', 'super_admin'].includes(user?.role);
  const archiveStaff = user => { if (isProtectedProfile(user)) return alert('This account is protected and cannot be deactivated.'); setArchiveCandidate(user); };
  const confirmArchiveStaff = async () => { if (!archiveCandidate) return; const user = archiveCandidate; const response = await fetch(`/api/staff/${user.id}`, { method: 'DELETE', credentials: 'include' }); if (response.ok) { setStaff(staff.filter(item => item.id !== user.id)); setArchivedStaff([...archivedStaff, { ...user, archived_at: new Date().toISOString() }]); setEditingStaff(null); } setArchiveCandidate(null); };
  const permanentlyDeleteStaff = async user => { if (isProtectedProfile(user)) return alert('This account is protected and cannot be deleted.'); if (!confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return; const response = await fetch(`/api/staff/${user.id}/permanent`, { method: 'DELETE', credentials: 'include' }); if (response.ok) { setStaff(staff.filter(item => item.id !== user.id)); setArchivedStaff(archivedStaff.filter(item => item.id !== user.id)); setEditingStaff(null); } };
  const reactivateStaff = async user => { const response = await fetch(`/api/staff/${user.id}/reactivate`, { method: 'PUT', credentials: 'include' }); if (response.ok) { setArchivedStaff(archivedStaff.filter(item => item.id !== user.id)); setStaff([...staff, { ...user, archived_at: undefined, blocked: false }]); } };
  const createRestaurantLocation = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(newLocation) });
    const data = await response.json();
    if (!response.ok) return setLocationError(data.error || 'Unable to create location');
    setRestaurantLocations([...restaurantLocations, data]); setNewLocation({ name: '', address: '', city: '', phone: '', latitude: '', longitude: '' }); setLocationError('');
  };
  const removeRestaurantLocation = async (id) => { if (!confirm('Remove this restaurant location?')) return; const response = await fetch(`/api/locations/${id}`, { method: 'DELETE', credentials: 'include' }); if (response.ok) setRestaurantLocations(restaurantLocations.filter(location => location.id !== id)); };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }, credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        fetchData(); // refresh stats
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add new menu item
  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) { alert('Product name and price are required.'); return; }

    try {
      const requestBody = {
        name: newItemName,
        category_slug: newItemCategory,
        price: parseFloat(newItemPrice),
        description: newItemDesc,
        cuisine: newItemCuisine,
        image_url: newItemImages.find(image => !image.startsWith('data:')) || '',
        image_urls: newItemImages.filter(image => !image.startsWith('data:')),
        is_deal: newItemIsDeal,
        is_available: newItemAvailable,
        sizes_json: newItemSizeVariants.filter(size => size.enabled && size.name.trim()).map(size => ({ name: size.name.trim(), priceDelta: Number(size.priceDelta || 0) })),
        options_json: newItemOptions.filter(group => group.name.trim() && group.options.some(option => option.name.trim())).map(group => ({ ...group, options: group.options.filter(option => option.name.trim()).map(option => ({ ...option, price: Number(option.price || 0) })) }))
      };
      const endpoint = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      let res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        }, credentials: 'include',
        body: JSON.stringify({ ...requestBody, image_url: newItemImages.find(Boolean) || '', image_urls: newItemImages.filter(Boolean) })
      });

      if (res.status === 413) {
        res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(requestBody) });
        if (res.ok) alert('Menu item saved. The uploaded images were too large for the current server, so please use image URLs or smaller files.');
      }

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewItemName('');
        setNewItemPrice('');
        setNewItemDesc('');
        setNewItemCuisine('');
        setNewItemImages(['']);
        setNewItemOptions([]);
        setNewItemSizes('');
        setNewItemSizeVariants([{ enabled: true, name: 'Small', priceDelta: 0 }, { enabled: false, name: 'Medium', priceDelta: 550 }, { enabled: false, name: 'Large', priceDelta: 1100 }, { enabled: false, name: 'Extra Large', priceDelta: 1600 }]);
        setNewItemAvailable(true);
        setEditingProduct(null);
        fetchData();
        alert('Menu item saved successfully.');
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Unable to save menu item (${res.status}): ${error.error || 'Server rejected the request.'}`);
      }
    } catch (err) {
      alert(`Unable to save menu item: ${err.message || 'Please restart the server and try again.'}`);
    }
  };

  // Delete menu item
  const handleDeleteMenuItem = async (id) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setMenuItems(menuItems.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveProductEdit = async event => { event.preventDefault(); try { const response = await fetch(`/api/products/${productEdit.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name: productEdit.name, price: Number(productEdit.price), description: productEdit.description, category_slug: productEdit.category_slug }) }); const data = await response.json().catch(() => ({})); if (!response.ok) { alert(data.error || `Product save failed (${response.status}). Please sign in to this restaurant workspace.`); return; } setMenuItems(menuItems.map(item => item.id === data.id ? data : item)); setSelectedProduct(data); setProductEdit(null); } catch (error) { alert(`Product save failed: ${error.message}`); } };

  // Run SQL Query
  const handleExecuteSql = async () => {
    setSqlLoading(true);
    setSqlResult(null);
    try {
      const res = await fetch('/api/mysql/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, credentials: 'include',
        body: JSON.stringify({ sql: sqlQuery })
      });
      const data = await res.json();
      setSqlResult(data);
    } catch (err) {
      setSqlResult({ success: false, error: err.message });
    } finally {
      setSqlLoading(false);
    }
  };

  // Reset database seed
  const handleResetDb = async () => {
    if (!confirm('Reset MySQL database to original PDF seed data?')) return;
    try {
      await fetch('/api/mysql/reset', {
        method: 'POST',
        credentials: 'include'
      });
      fetchData();
      alert('Database restored successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredOrders = orders.filter(o => {
    const query = orderSearch.trim().toLowerCase();
    const matchesSearch = !query || [o.id, o.customer_name, o.customer_phone, o.customer_email, o.delivery_address].some(value => String(value || '').toLowerCase().includes(query));
    const matchesStatus = orderFilter === 'all' || o.status === orderFilter;
    const matchesPayment = paymentFilter === 'all' || o.payment_method === paymentFilter;
    const orderDate = o.created_at ? new Date(o.created_at) : null;
    const today = new Date();
    const matchesDate = dateFilter === 'all' || (orderDate && (dateFilter === 'today' ? orderDate.toDateString() === today.toDateString() : dateFilter === 'week' ? (today - orderDate) <= 7 * 86400000 : orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear()));
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  if (activeTab === 'staff' && teamManager) return <div className="min-h-full space-y-5"><div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs"><h2 className="text-lg font-black">Team & Tasks</h2><p className="mt-1 text-xs text-stone-500">All restaurant login accounts, with protected superadmin accounts shown consistently.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{staff.length ? staff.map(user => { const protectedAccount = user.role === 'super_admin' || (currentUser.role === 'admin' && user.role === 'admin'); return <button key={user.id} disabled={protectedAccount} onClick={() => setEditingStaff({ ...user, permissions: user.permissions || ['orders'] })} className={`rounded-2xl border p-4 text-left ${protectedAccount ? 'cursor-not-allowed border-stone-200 bg-stone-50 opacity-60' : 'border-stone-200 hover:border-amber-400 hover:bg-amber-50'}`}><div className="flex items-center gap-3"><img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`} alt="" className="h-10 w-10 rounded-full bg-stone-100 object-cover" /><div className="min-w-0 flex-1"><p className="font-bold">{user.name}</p><p className="truncate text-xs text-stone-500">{user.email}</p></div><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">{user.role === 'super_admin' ? 'Super Admin' : user.role_title || user.role}</span></div><p className="mt-3 text-xs text-stone-600">{user.permissions?.includes('*') ? 'All dashboard access' : `Task: ${user.task || 'No task assigned'}`}</p><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">{protectedAccount ? 'Protected account' : 'Click to edit access'}</p></button>; }) : <p className="col-span-full rounded-xl bg-stone-50 p-5 text-sm text-stone-500">No accounts found for this restaurant.</p>}</div></div><div className="rounded-2xl border border-stone-200 bg-white p-5"><h3 className="font-black">Archived members</h3><div className="mt-3 space-y-2">{archivedStaff.length ? archivedStaff.map(user => <div key={user.id} className="flex items-center justify-between rounded-xl bg-stone-50 p-3"><span className="text-sm font-bold">{user.name}</span><button onClick={() => reactivateStaff(user)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Reactivate</button></div>) : <p className="text-xs text-stone-400">No archived members.</p>}</div></div></div>;

  useEffect(() => { if (activeTab !== 'staff') return undefined; const openMember = event => { if (event.target.closest('button, input, select, textarea, .fixed')) return; const card = event.target.closest('.rounded-2xl'); if (!card) return; const member = staff.find(user => card.textContent?.includes(user.email)); if (member) setEditingStaff({ ...member, permissions: member.permissions || ['orders'] }); }; document.addEventListener('click', openMember); return () => document.removeEventListener('click', openMember); }, [activeTab, staff]);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 pb-16">
      {/* Top Bar */}
      <div className="bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(value => !value)} className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300" title={sidebarOpen ? 'Hide navigation' : 'Show navigation'}>
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <button
              onClick={onReturnToStore}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
            <div className="h-5 w-px bg-stone-800" />
            <h1 className="text-base font-extrabold tracking-tight font-['Syne',sans-serif]">
              NOM <span className="text-amber-400">NOSH</span> RESTAURANT DASHBOARD
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">Database:</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
              MySQL (nomnosh_pizza)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex gap-6 items-start">
        <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} shrink-0 rounded-2xl bg-stone-900 p-2 text-white shadow-xl sticky top-6 transition-[width] duration-200`}>
          {sidebarOpen && <p className="px-3 pt-2 pb-3 text-[10px] font-bold uppercase tracking-[.18em] text-stone-500">Workspace</p>}
          {[['orders', 'Orders', ShoppingCart], ['kitchen', 'Kitchen Display', ChefHat], ['riders', 'Delivery', Truck], ['inventory', 'Inventory', Package], ['analytics', 'Sales Analytics', BarChart3], ['customers', 'Customers', UserRound], ['promos', 'Promotions', Tag], ['finance', 'Finance & Refunds', Receipt], ['audit', 'Audit Logs', ShieldCheck], ['menu', 'Menu Catalog', Plus], ['categories', 'Categories', Tag], ['locations', 'Restaurant Locations', MapPin], ['mysql', 'MySQL Console', Database]].filter(([tab]) => canAccessTab(tab)).map(([tab, label, Icon]) => <button key={tab} onClick={() => setActiveTab(tab)} title={label} className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-2'} rounded-xl py-3 text-left text-xs font-bold transition-colors ${activeTab === tab ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800 hover:text-white'}`}><Icon className="h-4 w-4 shrink-0" />{sidebarOpen && <><span>{label}</span>{tab === 'orders' && <span className="ml-auto rounded-md bg-white/15 px-1.5 py-0.5 text-[10px]">{orders.length}</span>}</>}</button>)}
          {['admin', 'super_admin'].includes(currentUser?.role) && <button onClick={() => setActiveTab('staff')} title="Team & Tasks" className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-2'} rounded-xl py-3 text-left text-xs font-bold ${activeTab === 'staff' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'}`}><Users className="h-4 w-4" />{sidebarOpen && <span>Team & Tasks</span>}</button>}
          <div className="my-3 border-t border-stone-800" />
          <button onClick={fetchData} title="Refresh data" className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-2'} rounded-xl py-3 text-left text-xs font-bold text-stone-300 hover:bg-stone-800 hover:text-white`}><RefreshCw className={`h-4 w-4 shrink-0 ${loading ? 'animate-spin' : ''}`} />{sidebarOpen && <span>Refresh data</span>}</button>
        </aside>
        <main className="min-w-0 flex-1 space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-black font-mono tabular-nums text-stone-900">
              Rs. {Number(stats?.totalRevenue || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-400 mt-1">From completed orders</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Orders</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-black font-mono tabular-nums text-amber-600">
              {(stats?.pendingOrders || 0) + (stats?.preparingOrders || 0) + (stats?.onWayOrders || 0)}
            </p>
            <p className="text-[11px] text-stone-400 mt-1">Pending kitchen & riders</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Delivered</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-black font-mono tabular-nums text-emerald-700">
              {stats?.deliveredOrders || 0}
            </p>
            <p className="text-[11px] text-stone-400 mt-1">Successfully fulfilled</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Menu Items</span>
              <ShoppingCart className="w-4 h-4 text-stone-600" />
            </div>
            <p className="mt-2 text-2xl font-black font-mono tabular-nums text-stone-900">
              {stats?.totalMenuItems || menuItems.length}
            </p>
            <p className="text-[11px] text-stone-400 mt-1">Across 14 categories</p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center justify-end border-b border-stone-300 pb-2">
          <div className="hidden">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-200'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'menu'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-200'
              }`}
            >
              Menu Catalog ({menuItems.length})
            </button>
            <button
              onClick={() => setActiveTab('mysql')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'mysql'
                  ? 'bg-stone-900 text-amber-400 shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-amber-500" />
              <span>MySQL Console & DDL</span>
            </button>
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-medium flex items-center gap-1"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {['kitchen','riders','inventory','promos','finance','audit'].includes(activeTab) && <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-white p-3"><input value={operationSearch} onChange={e => setOperationSearch(e.target.value)} placeholder="Search this workspace..." className="min-w-[220px] flex-1 rounded-xl border border-stone-200 px-3 py-2 text-xs" /><select value={operationFilter} onChange={e => setOperationFilter(e.target.value)} className="rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold"><option value="all">All statuses</option><option value="pending">Pending</option><option value="preparing">Preparing</option><option value="on_way">On the way</option><option value="available">Available</option><option value="low">Low stock</option></select><button onClick={() => { setOperationSearch(''); setOperationFilter('all'); }} className="rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold">Clear filters</button></div>}
        {activeTab === 'customers' && <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-white p-3"><span className="text-xs font-bold self-center text-stone-500">Customer conditions:</span><button onClick={() => setOperationFilter('all')} className="rounded-lg border px-3 py-1.5 text-xs font-bold">All</button><button onClick={() => setOperationFilter('new')} className="rounded-lg border px-3 py-1.5 text-xs font-bold">New</button><button onClick={() => setOperationFilter('frequent')} className="rounded-lg border px-3 py-1.5 text-xs font-bold">Frequent</button><button onClick={() => setOperationFilter('high_value')} className="rounded-lg border px-3 py-1.5 text-xs font-bold">High value</button></div>}
        {activeTab === 'customers' && <div className="mb-3 flex gap-2 rounded-2xl border border-stone-200 bg-white p-3"><input value={operationSearch} onChange={e => setOperationSearch(e.target.value)} placeholder="Search name, email, or phone..." className="min-w-[240px] flex-1 rounded-xl border border-stone-200 px-3 py-2 text-xs" /><button onClick={() => { setOperationSearch(''); setOperationFilter('all'); }} className="rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold">Clear</button><button onClick={() => setCustomerFormOpen(true)} className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white">Create customer account</button></div>}
        {activeTab === 'customers' && <button onClick={() => setOperationSearch(operationSearch.trim())} className="mb-4 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white">Search customers</button>}
        {activeTab === 'customers' && <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-white p-3"><span className="self-center text-xs font-bold text-stone-500">More customer filters:</span><button onClick={() => setOperationFilter('low_spenders')} className="rounded-lg border px-3 py-1.5 text-xs font-bold">Lowest spenders</button><button onClick={() => setOperationFilter('top_spenders')} className="rounded-lg border px-3 py-1.5 text-xs font-bold">Highest spenders</button><button onClick={() => setOperationFilter('blocked')} className="rounded-lg border px-3 py-1.5 text-xs font-bold text-rose-600">Blocked</button><button onClick={() => setOperationFilter('active')} className="rounded-lg border px-3 py-1.5 text-xs font-bold text-emerald-600">Active</button></div>}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
            {/* Filter buttons */}
            <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex w-full flex-wrap gap-2">
                <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search order, customer, phone..." className="min-w-[220px] flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-amber-500" />
                <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs"><option value="all">All payments</option>{[...new Set(orders.map(o => o.payment_method).filter(Boolean))].map(method => <option key={method} value={method}>{method.replace(/_/g, ' ')}</option>)}</select>
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs"><option value="all">All dates</option><option value="today">Today</option><option value="week">Last 7 days</option><option value="month">This month</option></select>
                {(orderSearch || paymentFilter !== 'all' || dateFilter !== 'all' || orderFilter !== 'all') && <button onClick={() => { setOrderSearch(''); setPaymentFilter('all'); setDateFilter('all'); setOrderFilter('all'); }} className="rounded-lg px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100">Clear filters</button>}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {['all', 'pending', 'preparing', 'on_way', 'delivered', 'cancelled'].map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-bold transition-colors ${
                      orderFilter === st
                        ? 'bg-stone-900 text-white'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {st === 'all' ? 'All Orders' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <span className="text-xs text-stone-500 font-medium">
                Showing {filteredOrders.length} orders
              </span>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-100/80 text-stone-600 font-bold uppercase tracking-wider">
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer & Phone</th>
                    <th className="p-3.5">Delivery Location</th>
                    <th className="p-3.5">Items Ordered</th>
                    <th className="p-3.5">Total (PKR)</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.map(order => (
                    <tr key={order.id} onClick={() => { setSelectedOrder(order); setOrderDetailPage(true); }} className="cursor-pointer hover:bg-amber-50/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-amber-700">
                        {order.id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900">{order.customer_name}</div>
                        <div className="text-stone-500 font-mono text-[11px]">{order.customer_phone}</div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="line-clamp-2 text-stone-700">{order.delivery_address || 'Takeaway'}</div>
                        {Number.isFinite(Number(order.latitude)) && Number.isFinite(Number(order.longitude)) && <a href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="mt-1 block font-mono text-[10px] text-amber-700 underline decoration-amber-300 underline-offset-2 hover:text-amber-900">{order.latitude}, {order.longitude} Â· Open in Maps</a>}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="line-clamp-2 text-stone-700">
                          {order.items_json?.map(i => `${i.quantity}x ${i.name}`).join(', ') || 'N/A'}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold tabular-nums text-stone-900">
                        Rs. {Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="p-3.5 uppercase text-[10px] font-semibold text-stone-600">
                        {order.payment_method.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border outline-hidden transition-colors ${
                            order.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.status === 'preparing'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : order.status === 'on_way'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : order.status === 'pending'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="on_way">On the Way</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setOrderDetailPage(false); }}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        No orders match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MENU CATALOG MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-stone-950 p-5 text-white shadow-lg sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Product bar</p>
                <h2 className="mt-1 text-xl font-black">Manage your products</h2>
                <p className="mt-1 text-xs text-stone-300">Add products, review details, and manage your catalog in one place.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-black text-stone-950 shadow-sm transition hover:bg-amber-400 sm:mt-0">
                <Plus className="h-4 w-4" /> Add product
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div><h2 className="text-sm font-bold uppercase tracking-wider text-stone-700">Product catalog</h2><p className="mt-1 text-xs text-stone-500">{menuItems.length} products in your menu</p></div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
              <div className="divide-y divide-stone-100">
                {menuItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 transition hover:bg-amber-50/40 sm:p-5">
                    <img src={item.image_url || item.image_urls?.[0]} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl bg-stone-100 object-cover object-center sm:h-20 sm:w-20" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-black text-stone-900 sm:text-base">{item.name}</h3>{item.is_deal && <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">Deal combo</span>}</div>
                      <p className="mt-1 line-clamp-1 text-xs text-stone-500">{item.description || 'No description added yet.'}</p>
                      <p className="mt-2 text-xs font-bold capitalize text-stone-400">{item.category_slug.replace(/-/g, ' ')}</p>
                    </div>
                    <div className="hidden text-right sm:block"><p className="text-[10px] uppercase tracking-wider text-stone-400">Price</p><p className="font-mono text-sm font-black text-amber-700">Rs. {Number(item.price).toLocaleString()}</p></div>
                    <div className="flex shrink-0 items-center gap-1"><button onClick={() => setSelectedProduct(item)} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-black text-amber-800 transition hover:bg-amber-100">View detail</button><button onClick={() => handleDeleteMenuItem(item.id)} className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600" title="Delete item"><Trash2 className="h-4 w-4" /></button></div>
                  </div>
                ))}
                {menuItems.length === 0 && <div className="p-10 text-center text-sm text-stone-400">No products yet. Add your first product above.</div>}
                {/* Keep the old table markup out of the layout while retaining no duplicate rows. */}
                <div className="hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-100/80 text-stone-600 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Image</th>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price (PKR)</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {menuItems.map(item => (
                      <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3.5">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                          />
                        </td>
                        <td className="p-3.5 font-bold text-stone-900">
                          {item.name}
                        </td>
                        <td className="p-3.5 capitalize text-stone-600">
                          {item.category_slug.replace(/-/g, ' ')}
                        </td>
                        <td className="p-3.5 font-mono font-bold tabular-nums text-amber-700">
                          Rs. {Number(item.price).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          {item.is_deal ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                              Deal Combo
                            </span>
                          ) : (
                            <span className="text-stone-400">Regular</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {['kitchen','riders','inventory','analytics','customers','promos','finance','audit'].includes(activeTab) && (() => {
          const activeOrders = orders.filter(o => !['delivered','cancelled'].includes(o.status));
          const revenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
          const customers = [...new Map(orders.map(o => [o.customer_email || o.customer_phone || o.customer_name, o])).values()];
          const cards = {
            kitchen: { title: 'Kitchen display', subtitle: 'Live preparation queue', icon: ChefHat, items: activeOrders.filter(o => ['pending','preparing'].includes(o.status)), empty: 'Kitchen queue is clear.' },
            riders: { title: 'Delivery management', subtitle: 'Assign and monitor active deliveries', icon: Truck, items: activeOrders.filter(o => o.status === 'on_way'), empty: 'No deliveries on the road.' },
            inventory: { title: 'Inventory tracking', subtitle: 'Stock levels and low-stock alerts', icon: Package, items: menuItems.slice(0, 8), empty: 'No inventory records yet.' },
            customers: { title: 'Customer management', subtitle: 'Recent customers and order history', icon: UserRound, items: customers, empty: 'No customer records yet.' },
            promos: { title: 'Coupons & promotions', subtitle: 'Create and schedule offers', icon: Tag, items: [], empty: 'No active promotions. Create your first offer.' },
            finance: { title: 'Refunds & reconciliation', subtitle: 'Payment verification and cash collection', icon: Receipt, items: orders.filter(o => o.payment_method), empty: 'No payment records yet.' },
            audit: { title: 'Audit logs & permissions', subtitle: 'Recent changes across the dashboard', icon: ShieldCheck, items: [], empty: 'Activity logs will appear here.' }
          }[activeTab];
          const sourceItems = Array.isArray(operationsData[activeTab]) ? operationsData[activeTab] : (cards?.items || []);
          const visibleItems = sourceItems.filter(item => {
            const haystack = JSON.stringify(item).toLowerCase();
            if (activeTab === 'customers') { const matchesSearch = !operationSearch.trim() || haystack.includes(operationSearch.toLowerCase()); if (!matchesSearch) return false; if (operationFilter === 'blocked') return Boolean(item.blocked); if (operationFilter === 'active') return !item.blocked; return true; }
            return (!operationSearch.trim() || haystack.includes(operationSearch.toLowerCase())) && (operationFilter === 'all' || item.status === operationFilter || (operationFilter === 'low' && Number(item.stock) <= Number(item.low_stock_threshold || 5)));
          });
          if (activeTab === 'analytics') { const analytics = operationsData.analytics || {}; const completed = orders.filter(o => o.status === 'delivered'); const revenueValue = Number(analytics.revenue ?? completed.reduce((s, o) => s + Number(o.total_amount || 0), 0)); const orderValue = Number(analytics.orders ?? orders.length); const averageValue = Number(analytics.average_order ?? (orderValue ? revenueValue / orderValue : 0)); const days = Object.entries(analytics.byDay || {}).slice(-14); return <div className="space-y-5"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">Sales analytics</h2><p className="text-xs text-stone-500">Live performance from completed orders</p></div><button onClick={fetchData} className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white">Refresh analytics</button></div><div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border bg-white p-5"><p className="text-xs font-bold uppercase text-stone-500">Revenue</p><p className="mt-2 text-2xl font-black">Rs. {revenueValue.toLocaleString()}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs font-bold uppercase text-stone-500">Orders</p><p className="mt-2 text-2xl font-black">{orderValue}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs font-bold uppercase text-stone-500">Average order</p><p className="mt-2 text-2xl font-black">Rs. {Math.round(averageValue).toLocaleString()}</p></div></div><div className="rounded-2xl border bg-white p-5"><h3 className="font-black">Daily revenue</h3>{days.length ? <div className="mt-5 space-y-3">{days.map(([day, value]) => <div className="flex items-center gap-3" key={day}><span className="w-24 text-xs text-stone-500">{day}</span><div className="h-3 flex-1 rounded-full bg-stone-100"><div className="h-3 rounded-full bg-amber-500" style={{ width: `${Math.min(100, Number(value) / Math.max(1, revenueValue) * 100 * days.length)}%` }} /></div><span className="w-28 text-right text-xs font-bold">Rs. {Number(value).toLocaleString()}</span></div>)}</div> : <p className="mt-8 text-center text-sm text-stone-500">No completed-order analytics available yet.</p>}</div></div>; }
          if (activeTab === 'customers') {
            if (operationFilter === 'top_spenders') visibleItems.sort((a, b) => Number(b.spent || 0) - Number(a.spent || 0));
            if (operationFilter === 'low_spenders') visibleItems.sort((a, b) => Number(a.spent || 0) - Number(b.spent || 0));
            if (operationFilter === 'frequent') visibleItems.sort((a, b) => Number(b.orders || 0) - Number(a.orders || 0));
            const pageCount = Math.max(1, Math.ceil(visibleItems.length / 30));
            const pageItems = visibleItems.slice((customerPage - 1) * 30, customerPage * 30);
            return <div className="space-y-3">{pageItems.map((customer, index) => <div key={customer.account_id || customer.id || customer.email || index} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs"><img src={customer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name || 'customer')}`} className="h-11 w-11 rounded-xl bg-stone-100" alt="Customer avatar" /><div className="min-w-0 flex-1"><p className="truncate font-black">{customer.name}</p><p className="truncate text-xs text-stone-500">{customer.email || customer.phone}</p><p className="text-[11px] text-stone-400">{customer.orders || 0} orders Â· Rs. {Number(customer.spent || 0).toLocaleString()}</p></div><button onClick={() => viewCustomer(customer)} className="rounded-lg border border-stone-200 px-3 py-2 text-[11px] font-bold">View details</button>{customer.account_id && <button onClick={() => toggleCustomerBlockFor(customer)} className={`rounded-lg px-3 py-2 text-[11px] font-bold text-white ${customer.blocked ? 'bg-emerald-600' : 'bg-rose-600'}`}>{customer.blocked ? 'Unblock' : 'Block'}</button>}<button onClick={() => deleteCustomer(customer)} className="rounded-lg border border-rose-200 px-3 py-2 text-[11px] font-bold text-rose-600">Delete</button></div>)}<div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-3"><span className="text-xs text-stone-500">Showing {pageItems.length} of {visibleItems.length} customers Â· Page {customerPage} of {pageCount}</span><div className="flex gap-2"><button disabled={customerPage <= 1} onClick={() => setCustomerPage(p => Math.max(1, p - 1))} className="rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-40">Previous</button><button disabled={customerPage >= pageCount} onClick={() => setCustomerPage(p => Math.min(pageCount, p + 1))} className="rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-40">Next</button></div></div></div>;
          }
          if (activeTab === 'customers') { const pageCount = Math.max(1, Math.ceil(visibleItems.length / 30)); const pageItems = visibleItems.slice((customerPage - 1) * 30, customerPage * 30); return <div className="space-y-3">{pageItems.map((customer, index) => <div key={customer.account_id || customer.email || index} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs"><img src={customer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name || 'customer')}`} className="h-11 w-11 rounded-xl bg-stone-100" alt="Customer" /><div className="min-w-0 flex-1"><p className="truncate font-black">{customer.name}</p><p className="truncate text-xs text-stone-500">{customer.email || customer.phone}</p><p className="text-[11px] text-stone-400">{customer.orders || 0} orders Â· Rs. {Number(customer.spent || 0).toLocaleString()} {customer.blocked && <span className="font-bold text-rose-600">Â· Blocked</span>}</p></div><button onClick={async () => { const response = await fetch(`/api/customers/detail?email=${encodeURIComponent(customer.email || customer.phone)}`, { credentials: 'include' }); if (response.ok) setCustomerDetail(await response.json()); }} className="rounded-lg border border-stone-200 px-3 py-2 text-[11px] font-bold">View details</button>{customer.account_id && <button onClick={() => toggleCustomerBlockFor(customer)} className={`rounded-lg px-3 py-2 text-[11px] font-bold text-white ${customer.blocked ? 'bg-emerald-600' : 'bg-rose-600'}`}>{customer.blocked ? 'Unblock' : 'Block'}</button>}<button onClick={() => deleteCustomer(customer)} className="rounded-lg border border-rose-200 px-3 py-2 text-[11px] font-bold text-rose-600">Delete</button></div>)}<div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-3"><span className="text-xs text-stone-500">Showing {pageItems.length} of {visibleItems.length} customers Â· Page {customerPage} of {pageCount}</span><div className="flex gap-2"><button disabled={customerPage <= 1} onClick={() => setCustomerPage(p => Math.max(1, p - 1))} className="rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-40">Previous</button><button disabled={customerPage >= pageCount} onClick={() => setCustomerPage(p => Math.min(pageCount, p + 1))} className="rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-40">Next</button></div></div></div>; }
          if (activeTab === 'analytics') return <div className="space-y-5"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">Sales analytics</h2><p className="text-xs text-stone-500">Performance snapshot across all branches</p></div><select className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold"><option>Last 30 days</option><option>This week</option><option>This year</option></select></div><div className="grid gap-4 md:grid-cols-4">{[['Revenue', `Rs. ${revenue.toLocaleString()}`, 'â†‘ 12.4%'], ['Orders', orders.length, 'â†‘ 8.2%'], ['Avg. order', `Rs. ${orders.length ? Math.round(revenue / orders.length).toLocaleString() : 0}`, 'â†‘ 4.1%'], ['Peak hour', '8:00 PM', 'Friday']].map(([label,value,change]) => <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs" key={label}><p className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p><p className="mt-1 text-xs font-bold text-emerald-600">{change}</p></div>)}</div><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border border-stone-200 bg-white p-5"><h3 className="font-black">Revenue trend</h3><div className="mt-8 flex h-40 items-end gap-2">{[38,52,45,70,62,82,74,91,68,78,84,96].map((height,i) => <div key={i} className="flex-1 rounded-t-lg bg-amber-500" style={{height: `${height}%`}} />)}</div><div className="mt-2 flex justify-between text-[10px] text-stone-400"><span>1 Jun</span><span>15 Jun</span><span>30 Jun</span></div></div><div className="rounded-2xl border border-stone-200 bg-white p-5"><h3 className="font-black">Best-selling items</h3>{menuItems.slice(0,5).map((item,i) => <div className="mt-4 flex items-center gap-3" key={item.id}><span className="w-5 text-xs font-black text-stone-400">0{i+1}</span><span className="flex-1 text-sm font-bold">{item.name}</span><span className="text-xs font-bold text-amber-700">{[48,36,29,22,18][i]} sold</span></div>)}</div></div></div>;
          return <div className="space-y-5"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">{cards.title}</h2><p className="text-xs text-stone-500">{cards.subtitle}</p></div><button className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white">+ Add {activeTab === 'promos' ? 'promotion' : activeTab === 'inventory' ? 'ingredient' : 'record'}</button></div><div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-amber-800">Needs attention</p><p className="mt-2 text-3xl font-black text-amber-900">{activeTab === 'inventory' ? 3 : activeOrders.length}</p><p className="mt-1 text-xs text-amber-800">Active records</p></div><div className="rounded-2xl border border-stone-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Today</p><p className="mt-2 text-3xl font-black">{activeTab === 'customers' ? customers.length : orders.length}</p><p className="mt-1 text-xs text-stone-500">Total records</p></div><div className="rounded-2xl border border-stone-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Status</p><p className="mt-2 text-xl font-black text-emerald-700">All systems live</p><p className="mt-1 text-xs text-stone-500">Updated just now</p></div></div><div className="rounded-2xl border border-stone-200 bg-white p-5"><div className="mb-4 flex items-center gap-2"><cards.icon className="h-5 w-5 text-amber-600" /><h3 className="font-black">{activeTab === 'inventory' ? 'Ingredient stock' : activeTab === 'customers' ? 'Recent customers' : 'Queue activity'}</h3></div>{cards.items.length ? <div className="divide-y divide-stone-100">{cards.items.slice(0,8).map((item,i) => <div className="flex items-center gap-3 py-3" key={item.id || i}><div className="h-9 w-9 rounded-xl bg-stone-100 flex items-center justify-center text-xs font-black text-stone-600">{activeTab === 'customers' ? String(item.customer_name || '?').slice(0,1) : activeTab === 'inventory' ? <Package className="h-4 w-4" /> : `#${String(item.id).slice(-3)}`}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{activeTab === 'customers' ? item.customer_name : activeTab === 'inventory' ? item.name : `Order #${item.id}`}</p><p className="text-xs text-stone-500">{activeTab === 'customers' ? (item.customer_email || item.customer_phone || 'No contact') : activeTab === 'inventory' ? 'Stock level: 24 units' : `${item.status?.replace('_',' ')} Â· Rs. ${Number(item.total_amount || 0).toLocaleString()}`}</p></div><button className="rounded-lg border border-stone-200 px-3 py-1.5 text-[11px] font-bold text-stone-600">View</button></div>)}</div> : <div className="rounded-xl bg-stone-50 py-12 text-center text-sm font-bold text-stone-500">{cards.empty}</div>}</div></div>;
        })()}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-stone-950 p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Restaurant catalog</p><h2 className="mt-1 text-xl font-black">Categories</h2><p className="mt-1 text-xs text-stone-300">These categories belong only to this restaurant workspace.</p></div>
            <form onSubmit={addCategory} className="flex gap-2 rounded-2xl border border-stone-200 bg-white p-4"><input required value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New category name" className="min-w-0 flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm" /><button className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white">Add category</button></form>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map(category => <div key={category.id} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4"><div><p className="font-black">{category.name}</p><p className="mt-1 text-[11px] text-stone-500">/{category.slug}</p></div><div className="flex gap-1"><button onClick={() => { setCategoryEditName(category.name); setCategoryModal({ type: 'edit', category }); }} className="rounded-lg px-3 py-2 text-xs font-bold text-stone-600 hover:bg-amber-50">Edit</button><button onClick={() => setCategoryModal({ type: 'delete', category })} className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600" title="Delete category"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>
            {categoryModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/70 p-4" onClick={() => setCategoryModal(null)}><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={event => event.stopPropagation()}><h3 className="text-xl font-black">{categoryModal.type === 'delete' ? 'Delete category?' : 'Edit category'}</h3>{categoryModal.type === 'delete' ? <p className="mt-2 text-sm text-stone-500">This will remove <span className="font-bold text-stone-800">{categoryModal.category.name}</span> from this restaurant only. Products are not deleted.</p> : <input autoFocus value={categoryEditName} onChange={event => setCategoryEditName(event.target.value)} className="mt-5 w-full rounded-xl border border-stone-200 p-3 text-sm" placeholder="Category name" /> }<div className="mt-6 flex justify-end gap-2"><button onClick={() => setCategoryModal(null)} className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold">Cancel</button><button onClick={categoryModal.type === 'delete' ? removeCategory : editCategory} className={`rounded-xl px-4 py-2.5 text-xs font-bold text-white ${categoryModal.type === 'delete' ? 'bg-rose-600' : 'bg-amber-600'}`}>{categoryModal.type === 'delete' ? 'Delete category' : 'Save changes'}</button></div></div></div>}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
              <h2 className="text-lg font-black text-stone-900">Restaurant locations</h2><p className="mt-1 text-xs text-stone-500">Add and manage multiple branches for your restaurant.</p>
              <form onSubmit={createRestaurantLocation} className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {['name','address','city','phone','latitude','longitude'].map(field => <input key={field} required={['name','latitude','longitude'].includes(field)} value={newLocation[field]} onChange={event => setNewLocation({ ...newLocation, [field]: event.target.value })} placeholder={field.replace(/^./, char => char.toUpperCase())} className="rounded-xl border border-stone-300 px-3 py-2.5 text-xs outline-none focus:border-amber-500" />)}
                <button className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white">Add restaurant location</button>
              </form>
              <div className="mt-4 grid gap-3 md:grid-cols-2">{restaurantLocations.map(location => <div key={location.id} className="rounded-xl border border-stone-200 p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{location.name}</p><p className="mt-1 text-xs text-stone-600">{location.address}{location.city && `, ${location.city}`}</p><p className="mt-2 text-[11px] text-stone-500">{location.latitude}, {location.longitude} Â· {location.phone || 'No phone'}</p></div><button onClick={() => removeRestaurantLocation(location.id)} className="h-fit text-rose-600" aria-label={`Remove ${location.name}`}><Trash2 className="h-4 w-4" /></button></div></div>)}</div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
              <h2 className="flex items-center gap-2 text-lg font-black text-stone-900"><MapPin className="h-5 w-5 text-amber-600" />Location Search</h2>
              <p className="mt-1 text-xs text-stone-500">Search addresses, colonies, blocks, streets, and landmarks in Lahore, Sahiwal, and Punjab, Pakistan.</p>
              <form onSubmit={searchLocations} className="mt-4 flex gap-2">
                <input value={locationQuery} onChange={event => setLocationQuery(event.target.value)} placeholder="e.g. Tariq Bin Ziad Colony Sahiwal" className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
                <button type="submit" disabled={locationLoading} className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"><Search className="h-4 w-4" />{locationLoading ? 'Searchingâ€¦' : 'Search'}</button>
              </form>
              {locationError && <p className="mt-3 text-xs text-rose-700">{locationError}</p>}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {locationResults.map(place => <div key={place.placeId} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs"><p className="font-bold text-stone-900">{place.placeName}</p><p className="mt-1 text-xs text-stone-600">{place.formattedAddress}</p><p className="mt-2 text-[11px] text-stone-500">{place.latitude}, {place.longitude} Â· {place.deliveryAvailable === false ? 'Outside delivery area' : 'Delivery available'}</p></div>)}
            </div>
          </div>
        )}

        {activeTab === 'staff' && currentUser?.role === 'super_admin' && <div className="space-y-5"><div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs"><h2 className="text-lg font-black">Create team member</h2><p className="mt-1 text-xs text-stone-500">Create a login, choose a team role, and assign their first task.</p><form onSubmit={createStaff} className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6"><input required placeholder="Full name" value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} className="rounded-xl border p-2.5 text-xs" /><input required type="email" placeholder="Email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className="rounded-xl border p-2.5 text-xs" /><input required type="password" placeholder="Password" value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} className="rounded-xl border p-2.5 text-xs" /><select value={staffForm.role_title} onChange={e => setStaffForm({ ...staffForm, role_title: e.target.value })} className="rounded-xl border p-2.5 text-xs"><option>Kitchen Team</option><option>Delivery Rider</option><option>Cashier</option><option>Inventory Manager</option><option>Customer Support</option><option>Shift Manager</option></select><select value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} className="rounded-xl border p-2.5 text-xs"><option value="staff">Staff access</option><option value="admin">Admin access</option></select><input placeholder="Initial task" value={staffForm.task} onChange={e => setStaffForm({ ...staffForm, task: e.target.value })} className="rounded-xl border p-2.5 text-xs" /><button className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white">Create member</button></form></div><div className="grid gap-3 md:grid-cols-2">{staff.map(user => <div key={user.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs"><div className="flex justify-between"><div><p className="font-bold">{user.name}</p><p className="text-xs text-stone-500">{user.email} Â· {user.role_title || user.role}</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">{user.role === 'admin' ? 'Admin access' : 'Staff access'}</span></div><div className="mt-4 flex gap-2"><input defaultValue={user.task} placeholder="Assign specific task" onBlur={e => assignStaffTask(user.id, e.target.value)} className="min-w-0 flex-1 rounded-xl border p-2.5 text-xs" /><span className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-800">Save on blur</span></div></div>)}</div></div>}

        {editingStaff && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/70 p-4" onClick={() => setEditingStaff(null)}><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-start justify-between"><div><h2 className="text-xl font-black">Edit team access</h2><p className="mt-1 text-xs text-stone-500">{editingStaff.name} Â· {editingStaff.email}</p></div><button onClick={() => setEditingStaff(null)} className="rounded-lg px-2 text-xl text-stone-400">Ã—</button></div><div className="mt-5 flex items-center justify-between rounded-xl bg-stone-50 p-3"><div><p className="text-xs font-bold">Admin access</p><p className="text-[11px] text-stone-500">Admins can access every dashboard tab.</p></div><button type="button" onClick={() => setEditingStaff({ ...editingStaff, role: editingStaff.role === 'admin' ? 'staff' : 'admin' })} className={`relative h-6 w-11 rounded-full transition ${editingStaff.role === 'admin' ? 'bg-amber-500' : 'bg-stone-300'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${editingStaff.role === 'admin' ? 'left-6' : 'left-1'}`} /></button></div><p className="mt-5 text-xs font-bold uppercase tracking-wider text-stone-500">Allowed dashboard tabs</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{dashboardTabs.map(([tab, label]) => { const enabled = editingStaff.role === 'admin' || (editingStaff.permissions || []).includes(tab); return <button type="button" key={tab} onClick={() => editingStaff.role !== 'admin' && setEditingStaff({ ...editingStaff, permissions: enabled ? (editingStaff.permissions || []).filter(item => item !== tab) : [...(editingStaff.permissions || []), tab] })} className="flex items-center justify-between rounded-xl border border-stone-200 px-3 py-3 text-left text-xs font-bold hover:border-amber-400"><span>{label}</span><span className={`relative h-5 w-9 rounded-full ${enabled ? 'bg-amber-500' : 'bg-stone-300'}`}><span className={`absolute top-1 h-3 w-3 rounded-full bg-white ${enabled ? 'left-5' : 'left-1'}`} /></span></button>; })}</div><div className="mt-5 flex justify-end gap-2"><button onClick={() => setEditingStaff(null)} className="rounded-xl border px-4 py-2.5 text-xs font-bold">Cancel</button><button onClick={() => deleteStaffMember(editingStaff)} className="mr-auto rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-700">Delete member</button><button onClick={() => saveStaffAccess(editingStaff)} className="rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-bold text-white">Save access</button></div></div></div>}

        {activeTab === 'staff' && !editingStaff && staff.length > 0 && <div className="rounded-2xl border border-stone-200 bg-white p-4"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Click a member to edit access</p><div className="flex flex-wrap gap-2">{staff.map(user => <button key={user.id} onClick={() => setEditingStaff({ ...user, permissions: user.permissions || ['orders'] })} className="rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold hover:border-amber-400">{user.name}</button>)}</div></div>}

        {activeTab === 'staff' && currentUser?.role === 'super_admin' && <div className="rounded-2xl border border-stone-200 bg-white p-5"><h3 className="font-black">Archived members</h3><p className="mt-1 text-xs text-stone-500">Archived members cannot sign in until reactivated.</p><div className="mt-3 space-y-2">{archivedStaff.length ? archivedStaff.map(user => <div key={user.id} className="flex items-center justify-between rounded-xl bg-stone-50 p-3"><div><p className="text-sm font-bold">{user.name}</p><p className="text-xs text-stone-500">{user.email} Â· archived {new Date(user.archived_at).toLocaleDateString()}</p></div><button onClick={() => reactivateStaff(user)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Reactivate</button></div>) : <p className="text-xs text-stone-400">No archived members.</p>}</div></div>}

        {editingStaff && <div className="fixed left-1/2 top-[calc(50%-14.5rem)] z-[90] flex -translate-x-1/2 gap-1 rounded-xl border border-stone-200 bg-white/95 p-1 shadow-lg"><button aria-label="Deactivate member" title="Deactivate member" onClick={() => archiveStaff(editingStaff)} className="rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"><Clock className="h-4 w-4" /></button><button aria-label="Delete permanently" title="Delete permanently" onClick={() => permanentlyDeleteStaff(editingStaff)} className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button></div>}
        {editingStaff && editingStaff.role === 'staff' && <div className="fixed left-1/2 top-[calc(50%-10rem)] z-[90] flex -translate-x-1/2 gap-2 rounded-xl bg-stone-900 p-1.5"><button onClick={() => setEditingStaff({ ...editingStaff, permissions: dashboardTabs.map(([tab]) => tab) })} className="rounded-lg px-3 py-2 text-[11px] font-bold text-white hover:bg-stone-700">Select all tabs</button><button onClick={() => setEditingStaff({ ...editingStaff, permissions: [] })} className="rounded-lg px-3 py-2 text-[11px] font-bold text-stone-300 hover:bg-stone-700">Clear all</button></div>}

        {archiveCandidate && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-stone-950/70 p-4"><div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Clock className="h-6 w-6" /></div><h2 className="mt-4 text-center text-lg font-black">Deactivate member?</h2><p className="mt-2 text-center text-sm text-stone-500"><strong>{archiveCandidate.name}</strong> will no longer be able to sign in. You can reactivate them later from Archived Members.</p><div className="mt-6 flex justify-end gap-2"><button autoFocus onClick={() => setArchiveCandidate(null)} className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold text-stone-700">Cancel</button><button onClick={confirmArchiveStaff} className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950">OK, deactivate</button></div></div></div>}

        {activeTab === 'staff' && currentUser?.role === 'admin' && <div className="space-y-5"><div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs"><h2 className="text-lg font-black">Team & Tasks</h2><p className="mt-1 text-xs text-stone-500">Manage staff members, roles, assigned tasks, and dashboard access.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{staff.map(user => <button key={user.id} onClick={() => setEditingStaff({ ...user, permissions: user.permissions || ['orders'] })} className="rounded-2xl border border-stone-200 p-4 text-left transition hover:border-amber-400 hover:bg-amber-50"><div className="flex items-center justify-between"><div><p className="font-bold">{user.name}</p><p className="text-xs text-stone-500">{user.email}</p></div><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">{user.role_title || user.role}</span></div><p className="mt-3 text-xs text-stone-600">Task: {user.task || 'No task assigned'}</p><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-700">Click to edit access</p></button>)}</div></div><div className="rounded-2xl border border-stone-200 bg-white p-5"><h3 className="font-black">Archived members</h3><div className="mt-3 space-y-2">{archivedStaff.length ? archivedStaff.map(user => <div key={user.id} className="flex items-center justify-between rounded-xl bg-stone-50 p-3"><span className="text-sm font-bold">{user.name}</span><button onClick={() => reactivateStaff(user)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Reactivate</button></div>) : <p className="text-xs text-stone-400">No archived members.</p>}</div></div></div>}

        {activeTab === 'staff' && currentUser?.role === 'super_admin' && <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs"><h2 className="text-lg font-black">Team & Tasks</h2><p className="mt-1 text-xs text-stone-500">All team members with their roles, tasks, and access.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{staff.map(user => <div key={user.id} className="rounded-2xl border border-stone-200 p-4"><div className="flex items-center justify-between"><div><p className="font-bold">{user.name}</p><p className="text-xs text-stone-500">{user.email}</p></div><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">{user.role === 'super_admin' ? 'Super Admin' : user.role_title || user.role}</span></div><p className="mt-3 text-xs text-stone-600">Task: {user.task || 'No task assigned'}</p><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-700">Click a member to edit access</p></div>)}</div></div>}

        {activeTab === 'staff' && teamManager && <div className="space-y-5"><div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs"><div className="flex items-center justify-between"><div><h2 className="text-lg font-black">Team & Tasks</h2><p className="mt-1 text-xs text-stone-500">All restaurant login accounts, including customers, are listed here.</p></div><Users className="h-6 w-6 text-amber-600" /></div><div className="mt-4 grid gap-3 md:grid-cols-2">{staff.length ? staff.map(user => { const locked = currentUser.role === 'admin' && user.role !== 'staff'; return <button key={user.id} disabled={locked} onClick={() => setEditingStaff({ ...user, permissions: user.permissions || ['orders'] })} className={`rounded-2xl border p-4 text-left transition ${locked ? 'cursor-not-allowed border-stone-100 bg-stone-50 opacity-70' : 'border-stone-200 hover:border-amber-400 hover:bg-amber-50'}`}><div className="flex items-center gap-3"><img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`} alt="" className="h-10 w-10 rounded-full bg-stone-100 object-cover" /><div className="min-w-0 flex-1"><p className="font-bold">{user.name}</p><p className="truncate text-xs text-stone-500">{user.email}</p></div><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">{user.role === 'super_admin' ? 'Super Admin' : user.role === 'customer' ? 'Customer account' : user.role_title || user.role}</span></div><p className="mt-3 text-xs text-stone-600">Permissions: {user.permissions?.includes('*') ? 'All dashboard access' : (user.permissions || ['orders']).join(', ')}</p><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">{locked ? 'Protected account' : 'Click to edit access'}</p></button>; }) : <p className="col-span-full rounded-xl bg-stone-50 p-5 text-sm text-stone-500">No accounts found for this restaurant.</p>}</div></div><div className="rounded-2xl border border-stone-200 bg-white p-5"><h3 className="font-black">Archived members</h3><div className="mt-3 space-y-2">{archivedStaff.length ? archivedStaff.map(user => <div key={user.id} className="flex items-center justify-between rounded-xl bg-stone-50 p-3"><div><p className="text-sm font-bold">{user.name}</p><p className="text-xs text-stone-500">{user.email}</p></div><button onClick={() => reactivateStaff(user)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Reactivate</button></div>) : <p className="text-xs text-stone-400">No archived members.</p>}</div></div></div>}

        {/* TAB 3: MYSQL CONSOLE & DATABASE SCHEMA */}
        {activeTab === 'mysql' && (
          <div className="space-y-6">
            {/* SQL Terminal Box */}
            <div className="bg-stone-950 text-stone-100 rounded-2xl p-5 border border-stone-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-amber-400">MySQL 8.0 Query Terminal</span>
                  <span className="text-[11px] text-stone-500 font-mono">nomnosh_pizza database</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetDb}
                    className="px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-mono transition-colors"
                  >
                    Restore Seed Data
                  </button>
                </div>
              </div>

              {/* Sample queries shortcut */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-stone-500">Quick SQL:</span>
                <button
                  onClick={() => setSqlQuery("SELECT * FROM orders WHERE status = 'delivered';")}
                  className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800"
                >
                  Delivered Orders
                </button>
                <button
                  onClick={() => setSqlQuery("SELECT id, name, price, category_slug FROM menu_items WHERE price < 1000;")}
                  className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800"
                >
                  Items Under Rs 1000
                </button>
                <button
                  onClick={() => setSqlQuery("SHOW TABLES;")}
                  className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800"
                >
                  SHOW TABLES
                </button>
                <button
                  onClick={() => setSqlQuery("DESCRIBE users;")}
                  className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800"
                >
                  DESC users
                </button>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full bg-stone-900 text-amber-200 font-mono text-xs p-3 rounded-xl border border-stone-800 focus:border-amber-500 outline-hidden resize-none"
                  placeholder="Enter MySQL query: SELECT * FROM orders..."
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleExecuteSql}
                    disabled={sqlLoading}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-stone-950" />
                    <span>{sqlLoading ? 'Executing Query...' : 'Run Query'}</span>
                  </button>
                </div>
              </div>

              {/* SQL Result Box */}
              {sqlResult && (
                <div className="mt-4 pt-4 border-t border-stone-800 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>
                      {sqlResult.success ? `Query OK: ${sqlResult.rowCount || sqlResult.affectedRows || 0} row(s)` : 'Execution Error'}
                    </span>
                    <span>{sqlResult.executionTimeMs} ms</span>
                  </div>

                  {sqlResult.success ? (
                    sqlResult.rows && sqlResult.rows.length > 0 ? (
                      <div className="overflow-x-auto max-h-72 rounded-lg border border-stone-800 bg-stone-900">
                        <table className="w-full text-left text-xs text-stone-300">
                          <thead>
                            <tr className="border-b border-stone-800 bg-stone-950 text-stone-400">
                              {sqlResult.columns.map(c => (
                                <th key={c} className="p-2 font-bold">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800">
                            {sqlResult.rows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-stone-800/50">
                                {sqlResult.columns.map(c => (
                                  <td key={c} className="p-2">
                                    {typeof row[c] === 'object' ? JSON.stringify(row[c]) : String(row[c])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-stone-400 italic">No rows returned or operation completed.</p>
                    )
                  ) : (
                    <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{sqlResult.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DDL Schema View */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                Relational MySQL Table Schemas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mysqlSchemas.map(schema => (
                  <div key={schema.table} className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-stone-900">
                        {schema.table}
                      </span>
                      <span className="text-[11px] font-mono text-stone-500">
                        {schema.rowCount} rows
                      </span>
                    </div>
                    <pre className="p-3 bg-stone-900 text-amber-200 font-mono text-[11px] rounded-xl overflow-x-auto">
                      {schema.ddl}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* View Order Modal */}
      {deleteCustomerTarget && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/60 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-black">Delete customer?</h2><p className="mt-2 text-sm text-stone-600">Delete <strong>{deleteCustomerTarget.name}</strong>? This account will be removed from the customer list and access will be disabled.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setDeleteCustomerTarget(null)} className="rounded-xl border px-4 py-2.5 text-xs font-bold">Cancel</button><button onClick={confirmDeleteCustomer} className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white">Delete customer</button></div></div></div>}
      {customerFormOpen && <div className="fixed inset-0 z-[65] flex items-center justify-center bg-stone-950/60 p-4"><form onSubmit={submitCustomerForm} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Create customer account</h2><p className="text-xs text-stone-500">The customer can use these credentials to log in.</p></div><button type="button" onClick={() => setCustomerFormOpen(false)} className="rounded-lg px-3 py-2 text-stone-500">âœ•</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><input required placeholder="Full name" value={customerForm.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} className="rounded-xl border p-3 text-sm" /><input required type="email" placeholder="Email / login" value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} className="rounded-xl border p-3 text-sm" /><input required placeholder="Phone number" value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} className="rounded-xl border p-3 text-sm" /><input required minLength="6" type="password" placeholder="Temporary password" value={customerForm.password} onChange={e => setCustomerForm({ ...customerForm, password: e.target.value })} className="rounded-xl border p-3 text-sm" /><input placeholder="Address" value={customerForm.address} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} className="rounded-xl border p-3 text-sm sm:col-span-2" /><textarea placeholder="Customer notes" value={customerForm.notes} onChange={e => setCustomerForm({ ...customerForm, notes: e.target.value })} className="min-h-24 rounded-xl border p-3 text-sm sm:col-span-2" /></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setCustomerFormOpen(false)} className="rounded-xl border px-4 py-2.5 text-xs font-bold">Cancel</button><button className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white">Create customer</button></div></form></div>}
      {customerPickerOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"><div className="max-h-[80vh] w-full max-w-xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Select customer account</h2><p className="text-xs text-stone-500">Choose a customer to open their complete account</p></div><button onClick={() => setCustomerPickerOpen(false)} className="rounded-lg px-3 py-2 text-stone-500 hover:bg-stone-100">âœ•</button></div><div className="mt-5 space-y-2">{(operationsData.customers || []).map((customer, index) => <button key={customer.account_id || customer.email || index} onClick={() => selectCustomerDetail(customer)} className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 p-3 text-left hover:border-amber-400 hover:bg-amber-50"><img src={customer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name || 'customer')}`} className="h-10 w-10 rounded-xl bg-stone-100" alt="Customer avatar" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-black">{customer.name}</span><span className="block truncate text-xs text-stone-500">{customer.email || customer.phone}</span></span><span className="text-xs font-bold text-stone-500">Open â†’</span></button>)}</div></div></div>}
      {customerDetail && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><img src={customerDetail.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customerDetail.name)}`} onError={e => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customerDetail.name)}`; }} className="h-14 w-14 rounded-2xl bg-stone-100" alt="Customer avatar" /><div><h2 className="text-xl font-black">{customerDetail.name}</h2><p className="text-xs text-stone-500">{customerDetail.email || customerDetail.phone}</p></div></div><button onClick={() => setCustomerDetail(null)} className="rounded-lg px-3 py-2 text-stone-500 hover:bg-stone-100">âœ•</button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-stone-50 p-3"><p className="text-[10px] uppercase text-stone-500">Orders</p><p className="text-lg font-black">{customerDetail.order_count}</p></div><div className="rounded-xl bg-stone-50 p-3"><p className="text-[10px] uppercase text-stone-500">Total spent</p><p className="text-lg font-black">Rs. {Number(customerDetail.total_spent || 0).toLocaleString()}</p></div><div className={`rounded-xl p-3 ${customerDetail.blocked ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}><p className="text-[10px] uppercase">Account status</p><p className="text-lg font-black">{customerDetail.blocked ? 'Blocked' : 'Active'}</p></div></div><div className="mt-5 flex gap-2"><button onClick={toggleCustomerBlock} className={`rounded-xl px-4 py-2.5 text-xs font-bold text-white ${customerDetail.blocked ? 'bg-emerald-600' : 'bg-rose-600'}`}>{customerDetail.blocked ? 'Unblock customer' : 'Block customer'}</button></div><h3 className="mt-6 font-black">Order history</h3><div className="mt-2 divide-y divide-stone-100">{(customerDetail.orders || []).map(order => <div className="flex justify-between py-3 text-sm" key={order.id}><span className="font-bold">#{order.id}</span><span className="capitalize text-stone-500">{order.status?.replace('_',' ')}</span><span className="font-bold">Rs. {Number(order.total_amount || 0).toLocaleString()}</span></div>)}</div></div></div>}
      {customerDetail && (customerDetail.orders || []).length > 5 && <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-stone-900 shadow-2xl"><span className="text-xs font-bold">Order page {customerOrderPage} of {Math.ceil(customerDetail.orders.length / 5)}</span><button disabled={customerOrderPage <= 1} onClick={() => setCustomerOrderPage(p => Math.max(1, p - 1))} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40">Previous</button><button disabled={customerOrderPage >= Math.ceil(customerDetail.orders.length / 5)} onClick={() => setCustomerOrderPage(p => p + 1)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40">Next</button></div>}
      {blockReasonOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/60 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-black">Block customer</h2><p className="mt-2 text-sm text-stone-500">Enter a reason for blocking this customer.</p><textarea value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Example: repeated spam orders" className="mt-4 min-h-28 w-full rounded-xl border border-stone-300 p-3 text-sm" /><div className="mt-5 flex justify-end gap-2"><button onClick={() => setBlockReasonOpen(false)} className="rounded-xl border px-4 py-2.5 text-xs font-bold">Cancel</button><button onClick={confirmCustomerBlock} className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white">Block customer</button></div></div></div>}
      {promotionFormOpen && <div className="fixed inset-0 z-[65] flex items-center justify-center bg-stone-950/60 p-4"><form onSubmit={submitPromotionForm} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-black">Add promotion</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><input required placeholder="Coupon code" value={promotionForm.code} onChange={e => setPromotionForm({ ...promotionForm, code: e.target.value.toUpperCase() })} className="rounded-xl border p-3 text-sm" /><select value={promotionForm.type} onChange={e => setPromotionForm({ ...promotionForm, type: e.target.value })} className="rounded-xl border p-3 text-sm"><option value="fixed">Fixed amount</option><option value="percent">Percentage</option></select><input required type="number" min="0" placeholder="Discount value" value={promotionForm.value} onChange={e => setPromotionForm({ ...promotionForm, value: e.target.value })} className="rounded-xl border p-3 text-sm" /><input type="number" min="0" placeholder="Minimum order" value={promotionForm.minimum_order} onChange={e => setPromotionForm({ ...promotionForm, minimum_order: e.target.value })} className="rounded-xl border p-3 text-sm" /><input type="number" min="0" placeholder="Usage limit" value={promotionForm.usage_limit} onChange={e => setPromotionForm({ ...promotionForm, usage_limit: e.target.value })} className="rounded-xl border p-3 text-sm sm:col-span-2" /></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setPromotionFormOpen(false)} className="rounded-xl border px-4 py-2.5 text-xs font-bold">Cancel</button><button className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white">Create promotion</button></div></form></div>}
      {selectedInventory && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-black">{selectedInventory.name}</h2><button onClick={() => setSelectedInventory(null)} className="rounded-lg px-3 py-2 text-stone-500">âœ•</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-stone-50 p-4"><p className="text-xs text-stone-500">Current stock</p><p className="text-2xl font-black">{selectedInventory.stock ?? 0} {selectedInventory.unit || 'units'}</p></div><div className="rounded-xl bg-stone-50 p-4"><p className="text-xs text-stone-500">Low-stock threshold</p><p className="text-2xl font-black">{selectedInventory.low_stock_threshold ?? 5}</p></div></div><p className="mt-4 text-sm text-stone-600">Last updated: {selectedInventory.updated_at ? new Date(selectedInventory.updated_at).toLocaleString() : 'Not recorded'}</p></div></div>}
      {refundFormOpen && <div className="fixed inset-0 z-[65] flex items-center justify-center bg-stone-950/60 p-4"><form onSubmit={submitRefundForm} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-black">Add reconciliation record</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><input required placeholder="Order ID" value={refundForm.order_id} onChange={e => setRefundForm({ ...refundForm, order_id: e.target.value })} className="rounded-xl border p-3 text-sm" /><input required type="number" min="0" placeholder="Amount" value={refundForm.amount} onChange={e => setRefundForm({ ...refundForm, amount: e.target.value })} className="rounded-xl border p-3 text-sm" /><select value={refundForm.payment_method} onChange={e => setRefundForm({ ...refundForm, payment_method: e.target.value })} className="rounded-xl border p-3 text-sm"><option>cash_on_delivery</option><option>easypaisa</option><option>jazzcash</option><option>card</option></select><select value={refundForm.collection_status} onChange={e => setRefundForm({ ...refundForm, collection_status: e.target.value })} className="rounded-xl border p-3 text-sm"><option value="pending">Pending collection</option><option value="collected">Collected</option><option value="verified">Verified</option></select><textarea required placeholder="Reason / notes" value={refundForm.reason} onChange={e => setRefundForm({ ...refundForm, reason: e.target.value })} className="min-h-24 rounded-xl border p-3 text-sm sm:col-span-2" /></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setRefundFormOpen(false)} className="rounded-xl border px-4 py-2.5 text-xs font-bold">Cancel</button><button className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white">Save record</button></div></form></div>}
      {selectedOrder && (
        <div className={orderDetailPage ? "fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-amber-50 via-stone-100 to-stone-200" : "fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4"}>
          <div className={orderDetailPage ? "relative min-h-screen w-full max-w-6xl mx-auto p-5 sm:p-8 space-y-6" : "relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4"}>
            <div className={orderDetailPage ? "flex items-center justify-between rounded-3xl bg-stone-950 p-5 text-white shadow-xl" : "flex items-center justify-between border-b pb-3"}>
              <h3 className="font-extrabold text-lg text-stone-900">
                Order #{selectedOrder.id} {orderDetailPage ? 'Â· Full details' : 'Details'}
              </h3>
              {orderDetailPage && <button onClick={() => setOrderDetailPage(false)} className="mr-2 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white">Quick view</button>}
              <button onClick={() => { setSelectedOrder(null); setOrderDetailPage(false); }} className="p-1 rounded-lg hover:bg-stone-100">
                ✕
              </button>
            </div>

            {!orderDetailPage && <button onClick={() => setOrderDetailPage(true)} className="w-full rounded-xl bg-amber-600 px-4 py-3 text-xs font-bold text-white hover:bg-amber-700">Open full order page</button>}

            {orderDetailPage && <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-white p-5 shadow-sm"><div><p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Order status</p><p className="mt-1 text-lg font-black capitalize text-stone-900">{selectedOrder.status?.replace('_', ' ')}</p></div><select value={selectedOrder.status} onChange={e => { const status = e.target.value; handleUpdateStatus(selectedOrder.id, status); setSelectedOrder({ ...selectedOrder, status }); }} className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-bold"><option value="pending">Pending</option><option value="preparing">Processing / Preparing</option><option value="on_way">On the way</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></div>}

            <div className="space-y-2 text-xs text-stone-700">
              <p><strong>Customer:</strong> {selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
              <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
              <p><strong>Coordinates:</strong> {selectedOrder.latitude != null && selectedOrder.longitude != null ? <a href={`https://www.google.com/maps/search/?api=1&query=${selectedOrder.latitude},${selectedOrder.longitude}`} target="_blank" rel="noreferrer" className="text-amber-700 underline underline-offset-2">{selectedOrder.latitude}, {selectedOrder.longitude} Â· Open in Google Maps</a> : 'Not recorded for this order'}</p>
              {selectedOrder.location_source === 'current' && <p><strong>Location source:</strong> Browser current location</p>}
              {selectedOrder.location_city && <p><strong>Location:</strong> {[selectedOrder.location_city, selectedOrder.location_state, selectedOrder.location_country, selectedOrder.postal_code].filter(Boolean).join(', ')}</p>}
              <p><strong>Type:</strong> <span className="capitalize">{selectedOrder.order_type}</span></p>
              <p><strong>Payment:</strong> <span className="uppercase">{selectedOrder.payment_method}</span></p>
              <p><strong>Notes:</strong> {selectedOrder.notes || 'None'}</p>

              <div className="pt-2 border-t">
                <p className="font-bold mb-1">Items:</p>
                <div className="space-y-1">
                  {selectedOrder.items_json?.map((it, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 p-2">
                      <a href={`/#product-${it.id}`} className="flex min-w-0 items-center gap-3 rounded-xl p-1 hover:bg-amber-50" title="View this product in the storefront"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-amber-50">{it.image_url ? <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" /> : <ShoppingCart className="m-6 h-8 w-8 text-amber-500" />}</div><span><strong>{it.quantity}x</strong> {it.name} {it.selectedSize ? `(${it.selectedSize})` : ''}<small className="block text-stone-500">Quantity: {it.quantity} Â· View product</small></span></a>
                      <span className="font-mono font-bold">Rs. {(it.totalPrice || it.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t flex justify-between font-bold text-sm text-stone-900">
                <span>Total Amount:</span>
                <span className="text-amber-700 font-mono">Rs. {Number(selectedOrder.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={selectedProduct.image_url || selectedProduct.image_urls?.[0]} alt={selectedProduct.name} className="h-56 w-full object-cover object-center" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{selectedProduct.category_slug.replace(/-/g, ' ')}</p><h3 className="mt-1 text-2xl font-black text-stone-900">{selectedProduct.name}</h3></div><button onClick={() => setSelectedProduct(null)} className="rounded-xl p-2 text-stone-400 hover:bg-stone-100">Ã—</button></div>
              <p className="mt-4 text-sm leading-6 text-stone-600">{selectedProduct.description || 'No description added yet.'}</p>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-amber-50 p-4"><span className="text-xs font-bold uppercase tracking-wider text-stone-500">Price</span><span className="font-mono text-xl font-black text-amber-700">Rs. {Number(selectedProduct.price).toLocaleString()}</span></div>
              <div className="mt-5 flex justify-end gap-2"><button onClick={() => { const item = selectedProduct; setSelectedProduct(null); setEditingProduct(item); setNewItemName(item.name || ''); setNewItemCategory(item.category_slug || categories[0]?.slug || ''); setNewItemPrice(String(item.price ?? '')); setNewItemDesc(item.description || ''); setNewItemImages(item.image_urls?.length ? item.image_urls : [item.image_url || '']); setNewItemIsDeal(Boolean(item.is_deal)); setNewItemAvailable(item.is_available !== false); setNewItemSizes(Array.isArray(item.sizes_json) ? item.sizes_json.join('\n') : ''); setNewItemOptions(Array.isArray(item.options_json) ? item.options_json : []); setIsAddModalOpen(true); }} className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white">Edit product</button><button onClick={() => { setSelectedProduct(null); setIsAddModalOpen(false); }} className="rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-bold text-white">Close details</button></div>
            </div>
          </div>
        </div>
      )}

      {productEdit && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/70 p-4"><form onSubmit={saveProductEdit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-black">Edit product</h2><div className="mt-5 grid gap-3"><input required value={productEdit.name} onChange={e => setProductEdit({ ...productEdit, name: e.target.value })} className="rounded-xl border p-3 text-sm" placeholder="Product name" /><input required type="number" value={productEdit.price} onChange={e => setProductEdit({ ...productEdit, price: e.target.value })} className="rounded-xl border p-3 text-sm" placeholder="Price" /><select value={productEdit.category_slug} onChange={e => setProductEdit({ ...productEdit, category_slug: e.target.value })} className="rounded-xl border p-3 text-sm">{categories.map(category => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select><textarea value={productEdit.description || ''} onChange={e => setProductEdit({ ...productEdit, description: e.target.value })} className="min-h-24 rounded-xl border p-3 text-sm" placeholder="Description" /></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setProductEdit(null)} className="rounded-xl border px-4 py-2.5 text-xs font-bold">Cancel</button><button className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white">Save changes</button></div></form></div>}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="modal-scroll relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-lg text-stone-900 font-['Syne',sans-serif]">
                {editingProduct ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-100">
                x
              </button>
            </div>

            <form onSubmit={handleCreateMenuItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Smoky Peri Pizza"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Category *</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                >
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Price in PKR (Rs.) *</label>
                <input
                  type="number"
                  required
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="1250"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Fresh chicken chunks, mozzarella, secret sauce..."
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div><label className="font-bold block mb-1">Cuisine</label><input value={newItemCuisine} onChange={e => setNewItemCuisine(e.target.value)} placeholder="e.g. Pakistani, Italian, Chinese, Fast Food" className="w-full rounded-xl border border-stone-300 p-2.5" /></div>

              <div className="product-image-field">
                <label className="font-bold block mb-1">Product Images</label>
                <p className="mb-2 text-[11px] text-stone-500">The first image is the primary image shown on product cards and the website. Large images are fitted neatly into the display area.</p>
                <textarea rows={3} value={newItemImages.filter(image => !image.startsWith('data:')).join('\n')} onChange={e => setNewItemImages(e.target.value.split(/\n|,/).map(value => value.trim()).filter(Boolean).slice(0, 5))} placeholder="Paste multiple image URLs, one per line" className="w-full rounded-xl border border-stone-300 p-2.5 text-xs" />
                <label className="mt-2 block cursor-pointer rounded-xl border border-dashed border-stone-300 p-3 text-center text-xs font-bold text-stone-600 hover:bg-stone-50">Upload multiple images from PC<input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={async e => { const remaining = Math.max(0, 5 - newItemImages.filter(Boolean).length); const files = Array.from(e.target.files || []).slice(0, remaining); const loaded = await Promise.all(files.map(compressMenuImage)); setNewItemImages([...newItemImages.filter(Boolean), ...loaded.filter(Boolean)].slice(0, 5)); e.target.value = ''; }} /></label>
                <div className="space-y-2">{newItemImages.map((image, index) => <div key={index} className="flex gap-2"><input type="url" value={image.startsWith('data:') ? '' : image} onChange={(e) => { const next = [...newItemImages]; next[index] = e.target.value; setNewItemImages(next); }} placeholder={`Image ${index + 1} URL`} className="min-w-0 flex-1 p-2.5 rounded-xl border border-stone-300" /><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 5 * 1024 * 1024) return alert('Each image must be smaller than 5 MB.'); const reader = new FileReader(); reader.onload = () => { const next = [...newItemImages]; next[index] = String(reader.result); setNewItemImages(next); }; reader.readAsDataURL(file); }} className="w-32 rounded-xl border border-dashed border-stone-300 p-2 text-[10px]" />{newItemImages.length > 1 && <button type="button" onClick={() => setNewItemImages(newItemImages.filter((_, i) => i !== index))} className="px-2 text-rose-600">âœ•</button>}</div>)}</div>
                {newItemImages.length < 5 && <button type="button" onClick={() => setNewItemImages([...newItemImages, ''])} className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">+ Add another image</button>}
                <div className="mt-2 flex flex-wrap items-center gap-2"><label className="cursor-pointer rounded-lg border border-dashed border-stone-300 px-3 py-2 text-[11px] font-bold text-stone-600 hover:bg-stone-50">Select multiple files<input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={async (e) => { const files = Array.from(e.target.files || []).slice(0, 5 - newItemImages.filter(Boolean).length); const loaded = await Promise.all(files.map(file => new Promise(resolve => { if (file.size > 5 * 1024 * 1024) return resolve(null); const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file); }))); setNewItemImages([...newItemImages.filter(Boolean), ...loaded.filter(Boolean)].slice(0, 5)); e.target.value = ''; }} /></label><button type="button" disabled={newItemImages.filter(Boolean).length < 2} onClick={() => setNewItemImages([...newItemImages].sort(() => Math.random() - 0.5))} className="rounded-lg bg-stone-100 px-3 py-2 text-[11px] font-bold text-stone-700 disabled:opacity-40">â† Shuffle images</button></div>
                <div className="my-2 flex items-center gap-2 text-[11px] text-stone-400"><span className="h-px flex-1 bg-stone-200" />OR UPLOAD FROM PC<span className="h-px flex-1 bg-stone-200" /></div>
                <div className="mt-2 flex flex-wrap gap-3">{newItemImages.filter(Boolean).map((image, index) => <div key={index} draggable onDragStart={e => e.dataTransfer.setData('image-index', String(index))} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const from = Number(e.dataTransfer.getData('image-index')); const filled = newItemImages.filter(Boolean); const [moved] = filled.splice(from, 1); filled.splice(index, 0, moved); setNewItemImages(filled); }} className="group relative cursor-grab rounded-xl border-2 border-stone-200 bg-white p-1 shadow-2xs active:cursor-grabbing hover:border-amber-500"><button type="button" onClick={() => setPreviewImage(image)} className="cursor-zoom-in"><img src={image} alt={`Product preview ${index + 1}`} className="h-20 w-20 rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /></button><button type="button" onClick={() => setNewItemImages(newItemImages.filter((_, i) => i !== index))} className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow" aria-label={`Remove image ${index + 1}`}>Ã—</button><span className="absolute bottom-1 left-1 rounded bg-stone-950/75 px-1.5 py-0.5 text-[9px] font-bold text-white">{index === 0 ? 'Primary' : index + 1}</span></div>)}</div>
              </div>

              <div>
                <label className="font-bold block mb-1">Sizes / variants</label>
                <div className="space-y-2">{newItemSizeVariants.map((size, index) => <div key={index} className={`flex items-center gap-2 rounded-xl border p-2.5 ${size.enabled ? 'border-amber-200 bg-amber-50/50' : 'border-stone-200 bg-stone-50 opacity-70'}`}><button type="button" aria-pressed={size.enabled} onClick={() => setNewItemSizeVariants(current => current.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item))} className={`relative h-5 w-9 shrink-0 rounded-full ${size.enabled ? 'bg-amber-500' : 'bg-stone-300'}`}><span className={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${size.enabled ? 'left-5' : 'left-1'}`} /></button><input value={size.name} onChange={e => setNewItemSizeVariants(current => current.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white p-2 text-xs" placeholder="Size name" /><input type="number" min="0" value={size.priceDelta} onChange={e => setNewItemSizeVariants(current => current.map((item, i) => i === index ? { ...item, priceDelta: e.target.value } : item))} className="w-28 rounded-lg border border-stone-300 bg-white p-2 text-xs" placeholder="Extra Rs." /></div>)}</div>
                <p className="mt-1 text-[11px] text-stone-500">Enable only the sizes this product offers. Names and extra prices are fully editable.</p>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="dealCheck"
                  checked={newItemIsDeal}
                  onChange={(e) => setNewItemIsDeal(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="dealCheck" className="font-medium">Mark as Special Combo Deal</label>
                <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={newItemAvailable} onChange={e => setNewItemAvailable(e.target.checked)} className="h-4 w-4" /> Available on storefront</label>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <div><label className="block font-bold text-stone-900">Customization options</label><p className="mt-1 text-[11px] text-stone-500">Add groups like Spice Level, Toppings, Sizes, or Notes.</p></div>
                <div className="mt-3 space-y-3">{newItemOptions.map((group, gi) => <div key={gi} className="rounded-xl border border-amber-200 bg-white p-3"><div className="flex gap-2"><input value={group.name} onChange={e => { const next = [...newItemOptions]; next[gi] = { ...group, name: e.target.value }; setNewItemOptions(next); }} placeholder="Group name e.g. Spice Level" className="min-w-0 flex-1 rounded-lg border border-stone-300 p-2 text-xs" /><select value={group.type} onChange={e => { const next = [...newItemOptions]; next[gi] = { ...group, type: e.target.value }; setNewItemOptions(next); }} className="rounded-lg border border-stone-300 p-2 text-xs"><option value="single">Choose one</option><option value="multiple">Choose multiple</option><option value="notes">Text notes</option></select><button type="button" onClick={() => setNewItemOptions(newItemOptions.filter((_, i) => i !== gi))} className="px-2 text-rose-600">Ã—</button></div>{group.type === 'notes' ? <p className="mt-2 text-[11px] text-stone-400">Customers will see a text box for this group.</p> : <div className="mt-2 space-y-2">{group.options.map((option, oi) => <div key={oi} className="flex gap-2"><input value={option.name} onChange={e => { const next = [...newItemOptions]; const options = [...group.options]; options[oi] = { ...option, name: e.target.value }; next[gi] = { ...group, options }; setNewItemOptions(next); }} placeholder="Option name" className="min-w-0 flex-1 rounded-lg border border-stone-300 p-2 text-xs" /><input type="number" min="0" value={option.price} onChange={e => { const next = [...newItemOptions]; const options = [...group.options]; options[oi] = { ...option, price: e.target.value }; next[gi] = { ...group, options }; setNewItemOptions(next); }} placeholder="Extra Rs." className="w-24 rounded-lg border border-stone-300 p-2 text-xs" /><button type="button" onClick={() => { const next = [...newItemOptions]; next[gi] = { ...group, options: group.options.filter((_, i) => i !== oi) }; setNewItemOptions(next); }} className="px-1 text-rose-600">Ã—</button></div>)}<button type="button" onClick={() => { const next = [...newItemOptions]; next[gi] = { ...group, options: [...group.options, { name: '', price: 0 }] }; setNewItemOptions(next); }} className="text-[11px] font-bold text-amber-700">+ Add option</button></div>}</div>)}</div>
                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-amber-200 pt-3"><button type="button" onClick={() => setNewItemOptions(standardPizzaOptions.map(group => ({ ...group, options: group.options.map(option => ({ ...option })) })))} className="rounded-lg bg-amber-100 px-3 py-2 text-[11px] font-bold text-amber-900">Use pizza preset</button><button type="button" onClick={() => setNewItemOptions([...newItemOptions, { name: '', type: 'single', options: [{ name: '', price: 0 }] }])} className="rounded-lg bg-stone-950 px-3 py-2 text-[11px] font-bold text-white">+ Add group</button></div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {editingProduct ? 'Save product changes' : 'Save Item to MySQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {previewImage && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/85 p-6" onClick={() => setPreviewImage(null)}><div className="relative max-h-full max-w-4xl" onClick={event => event.stopPropagation()}><img src={previewImage} alt="Large product preview" className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl" /><button type="button" onClick={() => setPreviewImage(null)} className="absolute -right-3 -top-3 rounded-full bg-white px-3 py-1 text-lg font-bold text-stone-900 shadow">Ã—</button></div></div>}
    </div>
  );
}

