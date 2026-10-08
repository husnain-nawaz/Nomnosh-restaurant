import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingCart, Clock, CheckCircle, Plus, Edit2, Trash2,
  Database, RefreshCw, Terminal, Eye, Play, AlertCircle, ArrowLeft
} from 'lucide-react';

export default function Dashboard({ onReturnToStore, currentUser }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'mysql'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New Menu Item Form Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('regular-pizza-flavors');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemIsDeal, setNewItemIsDeal] = useState(false);

  // MySQL Console States
  const [sqlQuery, setSqlQuery] = useState("SELECT id, customer_name, total_amount, status FROM orders LIMIT 10;");
  const [sqlResult, setSqlResult] = useState(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [mysqlSchemas, setMysqlSchemas] = useState([]);

  // Fetch initial dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = {};

      const [statsRes, ordersRes, menuRes, catRes, schemaRes] = await Promise.all([
        fetch('/api/stats', { headers, credentials: 'include' }),
        fetch('/api/orders', { headers, credentials: 'include' }),
        fetch('/api/products'),
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
    if (!newItemName || !newItemPrice) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, credentials: 'include',
        body: JSON.stringify({
          name: newItemName,
          category_slug: newItemCategory,
          price: parseFloat(newItemPrice),
          description: newItemDesc,
          is_deal: newItemIsDeal
        })
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewItemName('');
        setNewItemPrice('');
        setNewItemDesc('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
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
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 pb-16">
      {/* Top Bar */}
      <div className="bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
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
        <div className="flex items-center justify-between border-b border-stone-300 pb-2">
          <div className="flex items-center gap-2">
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
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
            {/* Filter buttons */}
            <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-wrap items-center justify-between gap-3">
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
                    <th className="p-3.5">Items Ordered</th>
                    <th className="p-3.5">Total (PKR)</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-amber-700">
                        {order.id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900">{order.customer_name}</div>
                        <div className="text-stone-500 font-mono text-[11px]">{order.customer_phone}</div>
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
                          onClick={() => setSelectedOrder(order)}
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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
                Product Catalog & Pricing
              </h2>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Menu Item</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
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
        )}

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
      </div>

      {/* View Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-lg text-stone-900">
                Order #{selectedOrder.id} Details
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg hover:bg-stone-100">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-700">
              <p><strong>Customer:</strong> {selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
              <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
              <p><strong>Type:</strong> <span className="capitalize">{selectedOrder.order_type}</span></p>
              <p><strong>Payment:</strong> <span className="uppercase">{selectedOrder.payment_method}</span></p>
              <p><strong>Notes:</strong> {selectedOrder.notes || 'None'}</p>

              <div className="pt-2 border-t">
                <p className="font-bold mb-1">Items:</p>
                <div className="space-y-1">
                  {selectedOrder.items_json?.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{it.quantity}x {it.name} {it.selectedSize ? `(${it.selectedSize})` : ''}</span>
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

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-lg text-stone-900 font-['Syne',sans-serif]">
                Add New Menu Item
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-100">
                ✕
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dealCheck"
                  checked={newItemIsDeal}
                  onChange={(e) => setNewItemIsDeal(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="dealCheck" className="font-medium">Mark as Special Combo Deal</label>
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
                  Save Item to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
