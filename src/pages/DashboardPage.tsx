import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchDashboardData } from '../api/dashboardApi';
import type { DashboardData } from '../api/dashboardApi';
import { getPaymentSummary } from '../api/paymentsApi';
import type { PaymentSummaryStats } from '../types/payment';
import { getProducts } from '../api/productsApi';
import type { Product } from '../types/product';
import { getStockMovements } from '../api/stockMovementsApi';
import type { StockMovement } from '../types/stockMovement';

type RangeKey = 'all' | 'today' | 'week' | 'month' | 'custom';

const RANGE_LABELS: Record<RangeKey, string> = {
  all: 'All time',
  today: 'Today',
  week: 'Last 7 days',
  month: 'This month',
  custom: 'Custom',
};

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getRangeDates(range: RangeKey): { fromDate?: string; toDate?: string } {
  const today = new Date();
  const todayStr = toDateStr(today);

  if (range === 'today') return { fromDate: todayStr, toDate: todayStr };

  if (range === 'week') {
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    return { fromDate: toDateStr(weekAgo), toDate: todayStr };
  }

  if (range === 'month') {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { fromDate: toDateStr(firstOfMonth), toDate: todayStr };
  }

  return {};
}

const RANGE_BTN: React.CSSProperties = {
  padding: '0.2rem 0.65rem',
  fontSize: '0.775rem',
  borderRadius: '4px',
  border: '1px solid #d1d5db',
  background: 'white',
  color: '#374151',
  cursor: 'pointer',
  fontWeight: 400,
  lineHeight: 1.4,
};

const RANGE_BTN_ACTIVE: React.CSSProperties = {
  ...RANGE_BTN,
  border: '1px solid #4f46e5',
  background: '#4f46e5',
  color: 'white',
  fontWeight: 600,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryStats | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);

  const [selectedRange, setSelectedRange] = useState<RangeKey>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const [invProducts, setInvProducts] = useState<Product[]>([]);
  const [invMovements, setInvMovements] = useState<StockMovement[]>([]);
  const [invLoading, setInvLoading] = useState(true);
  const [invError, setInvError] = useState(false);

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setInvLoading(true);
    setInvError(false);
    Promise.all([
      getProducts({ take: 200 }),
      getStockMovements({ take: 5 }),
    ])
      .then(([{ data: products }, { data: movements }]) => {
        setInvProducts(products);
        setInvMovements(movements);
      })
      .catch(() => setInvError(true))
      .finally(() => setInvLoading(false));
  }, []);

  const fetchSummary = (fromDate?: string, toDate?: string) => {
    setSummaryLoading(true);
    setSummaryError(false);
    getPaymentSummary(fromDate, toDate)
      .then(({ data: d }) => setPaymentSummary(d))
      .catch(() => { setSummaryError(true); setPaymentSummary(null); })
      .finally(() => setSummaryLoading(false));
  };

  useEffect(() => {
    if (selectedRange === 'custom') return;
    const { fromDate, toDate } = getRangeDates(selectedRange);
    fetchSummary(fromDate, toDate);
  }, [selectedRange]);

  const handleRangeChange = (range: RangeKey) => {
    setSelectedRange(range);
  };

  const applyCustomRange = () => {
    fetchSummary(customFrom || undefined, customTo || undefined);
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h2>Dashboard</h2>
        </div>
        <div className="state-message">Loading dashboard…</div>
      </div>
    );
  }

  const stats = data?.appointmentStats ?? null;
  const upcoming = (data?.upcomingAppointments ?? []).slice(0, 5);

  const healthText =
    data?.healthOk === true ? 'Connected' : data?.healthOk === false ? 'Offline' : '—';
  const healthClass =
    data?.healthOk === true ? 'card-active' : data?.healthOk === false ? 'stat-offline' : 'stat-muted';

  const settingsValue =
    data?.settingsConfigured == null
      ? null
      : data.settingsConfigured
      ? 'Configured'
      : 'Not configured';
  const settingsColorClass =
    data?.settingsConfigured === true
      ? 'card-active'
      : data?.settingsConfigured === false
      ? 'stat-pending'
      : undefined;

  const statCard = (
    title: string,
    value: number | string | null,
    to: string,
    colorClass?: string,
    statusText?: boolean,
  ) => {
    const base = statusText ? 'card-status' : 'card-stat';
    return (
      <Link to={to} className="card-link">
        <div className="card">
          <div className="card-title">{title}</div>
          <div className={`${base}${value === null ? ' stat-muted' : colorClass ? ` ${colorClass}` : ''}`}>
            {value !== null ? value : '—'}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>
      <p className="page-subtitle">
        Welcome back{user?.fullName ? `, ${user.fullName}` : ''}. Here is a live summary of your modules.
      </p>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-title">Backend</div>
          <div className={`card-status ${healthClass}`}>{healthText}</div>
        </div>

        {statCard("Today's Appointments", stats?.todayCount ?? null, '/appointments')}
        {statCard(
          'Pending',
          stats?.pendingCount ?? null,
          '/appointments',
          stats?.pendingCount ? 'stat-pending' : undefined,
        )}
        {statCard('Upcoming 7 Days', stats?.upcoming7DaysCount ?? null, '/appointments')}
        {statCard(
          'Unread Messages',
          data?.unreadMessagesCount ?? null,
          '/messages',
          data?.unreadMessagesCount ? 'stat-pending' : undefined,
        )}
        {statCard('Active Staff', data?.activeStaffCount ?? null, '/staff')}
        {statCard('Active Services', data?.activeServicesCount ?? null, '/services')}
        {statCard('Published Posts', data?.publishedBlogCount ?? null, '/blog')}
        {statCard('Gallery Items', data?.activeGalleryCount ?? null, '/gallery')}
        {statCard('Settings', settingsValue, '/settings', settingsColorClass, true)}
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>Payment Summary</h3>
          <Link
            to="/payments"
            className="btn-outline"
            style={{ fontSize: '0.8125rem', padding: '0.3rem 0.75rem' }}
          >
            View all
          </Link>
        </div>

        {/* Range selector */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', margin: '0.6rem 0 0.25rem' }}>
          {(Object.keys(RANGE_LABELS) as RangeKey[]).map(r => (
            <button
              key={r}
              style={selectedRange === r ? RANGE_BTN_ACTIVE : RANGE_BTN}
              onClick={() => handleRangeChange(r)}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Custom date inputs */}
        {selectedRange === 'custom' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0.5rem 0', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
            <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>to</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
            <button className="btn-xs" onClick={applyCustomRange}>Apply</button>
          </div>
        )}

        {/* Summary content */}
        {summaryLoading ? (
          <div style={{ color: '#9ca3af', fontSize: '0.875rem', padding: '0.5rem 0' }}>Loading…</div>
        ) : summaryError || !paymentSummary ? (
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.5rem 0' }}>
            Payment summary unavailable.
          </p>
        ) : (
          <>
            <div className="dashboard-cards" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
              <div className="card">
                <div className="card-title">Total</div>
                <div className="card-stat">{paymentSummary.totalCount}</div>
              </div>
              <div className="card">
                <div className="card-title">Paid</div>
                <div className={`card-stat${paymentSummary.paidCount > 0 ? ' card-active' : ''}`}>
                  {paymentSummary.paidCount}
                </div>
              </div>
              <div className="card">
                <div className="card-title">Pending</div>
                <div className={`card-stat${paymentSummary.pendingCount > 0 ? ' stat-pending' : ''}`}>
                  {paymentSummary.pendingCount}
                </div>
              </div>
              <div className="card">
                <div className="card-title">Failed</div>
                <div className={`card-stat${paymentSummary.failedCount > 0 ? ' stat-offline' : ''}`}>
                  {paymentSummary.failedCount}
                </div>
              </div>
              <div className="card">
                <div className="card-title">Refunded</div>
                <div className="card-stat">{paymentSummary.refundedCount}</div>
              </div>
            </div>
            {paymentSummary.totalsByCurrency.length > 0 && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Currency</th>
                      <th>Paid</th>
                      <th>Pending</th>
                      <th>Failed</th>
                      <th>Refunded</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentSummary.totalsByCurrency.map(c => (
                      <tr key={c.currency}>
                        <td><strong>{c.currency}</strong></td>
                        <td style={{ color: '#166534' }}>{Number(c.paidAmount).toFixed(2)}</td>
                        <td style={{ color: c.pendingAmount > 0 ? '#92400e' : undefined }}>
                          {Number(c.pendingAmount).toFixed(2)}
                        </td>
                        <td style={{ color: c.failedAmount > 0 ? '#991b1b' : undefined }}>
                          {Number(c.failedAmount).toFixed(2)}
                        </td>
                        <td>{Number(c.refundedAmount).toFixed(2)}</td>
                        <td><strong>{Number(c.totalAmount).toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>Upcoming Appointments</h3>
          <Link
            to="/appointments"
            className="btn-outline"
            style={{ fontSize: '0.8125rem', padding: '0.3rem 0.75rem' }}
          >
            View all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="state-message" style={{ padding: '2rem' }}>
            No upcoming appointments.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(a => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{a.requestedDate.split('T')[0]}</td>
                    <td>{a.requestedTime}</td>
                    <td>{a.customerFullName}</td>
                    <td>{a.businessServiceTitle ?? '—'}</td>
                    <td>
                      <span className={`status-badge status-${a.status.toLowerCase()}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>Inventory</h3>
          <Link
            to="/products"
            className="btn-outline"
            style={{ fontSize: '0.8125rem', padding: '0.3rem 0.75rem' }}
          >
            Manage inventory
          </Link>
        </div>

        {invLoading ? (
          <div style={{ color: '#9ca3af', fontSize: '0.875rem', padding: '0.5rem 0' }}>Loading…</div>
        ) : invError ? (
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.5rem 0' }}>
            Inventory data unavailable. Check that the backend is running.
          </p>
        ) : (
          <>
            {/* Stats cards */}
            <div className="dashboard-cards" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
              <Link to="/products" className="card-link">
                <div className="card">
                  <div className="card-title">Total Products</div>
                  <div className="card-stat">{invProducts.length}</div>
                </div>
              </Link>
              <Link to="/products" className="card-link">
                <div className="card">
                  <div className="card-title">Active Products</div>
                  <div className={`card-stat${invProducts.filter(p => p.isActive).length > 0 ? ' card-active' : ''}`}>
                    {invProducts.filter(p => p.isActive).length}
                  </div>
                </div>
              </Link>
              <Link to="/products" className="card-link">
                <div className="card">
                  <div className="card-title">Low Stock</div>
                  <div className={`card-stat${invProducts.filter(p => p.isLowStock).length > 0 ? ' stat-pending' : ''}`}>
                    {invProducts.filter(p => p.isLowStock).length}
                  </div>
                </div>
              </Link>
            </div>

            {/* Low stock product list */}
            {invProducts.filter(p => p.isLowStock).length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Low Stock Products
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Stock</th>
                        <th>Min</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invProducts.filter(p => p.isLowStock).slice(0, 5).map(p => (
                        <tr key={p.id}>
                          <td>
                            {p.name}
                            {p.sku && (
                              <span style={{ color: '#94a3b8', marginLeft: '0.4rem', fontSize: '0.8rem' }}>
                                {p.sku}
                              </span>
                            )}
                          </td>
                          <td><strong style={{ color: '#92400e' }}>{p.currentStock}</strong></td>
                          <td style={{ color: '#64748b' }}>{p.minStock}</td>
                          <td style={{ color: '#64748b' }}>{p.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent stock movements */}
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              Recent Stock Movements
            </div>
            {invMovements.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No movements recorded yet.</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Before → After</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invMovements.map(sm => (
                      <tr key={sm.id}>
                        <td>
                          {sm.productName}
                          {sm.productSku && (
                            <span style={{ color: '#94a3b8', marginLeft: '0.4rem', fontSize: '0.8rem' }}>
                              {sm.productSku}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${sm.type === 'In' ? 'status-confirmed' : sm.type === 'Out' ? 'status-cancelled' : 'status-completed'}`}>
                            {sm.type}
                          </span>
                        </td>
                        <td>{sm.quantity}</td>
                        <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                          {sm.previousStock} → <strong style={{ color: '#1e293b' }}>{sm.newStock}</strong>
                        </td>
                        <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(sm.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
