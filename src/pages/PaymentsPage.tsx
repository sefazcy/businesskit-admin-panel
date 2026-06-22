import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Payment } from '../types/payment';
import type { PaymentFilters } from '../api/paymentsApi';
import {
  getPayments,
  markPaymentPaid,
  markPaymentFailed,
  markPaymentRefunded,
} from '../api/paymentsApi';
import { extractError } from '../utils/extractError';

const STATUS_OPTIONS = ['', 'Pending', 'Paid', 'Failed', 'Cancelled', 'Refunded'];

type PanelType = 'failed' | 'refunded';

function formatDateTime(dt: string | null): string {
  if (!dt) return '—';
  return new Date(dt).toLocaleString();
}

function truncate(text: string, max = 50): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function statusDate(p: Payment): string {
  if (p.status === 'Paid') return formatDateTime(p.paidAt);
  if (p.status === 'Failed') return formatDateTime(p.failedAt);
  if (p.status === 'Refunded') return formatDateTime(p.refundedAt);
  return '—';
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('');

  // immediate action (mark-paid)
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  // inline confirmation panel (mark-failed / mark-refunded)
  const [panelId, setPanelId] = useState<number | null>(null);
  const [panelType, setPanelType] = useState<PanelType | null>(null);
  const [panelInput, setPanelInput] = useState('');
  const [panelSubmitting, setPanelSubmitting] = useState(false);

  const fetchPayments = () => {
    setLoading(true);
    setError('');
    const filters: PaymentFilters = {};
    if (statusFilter) filters.status = statusFilter;

    getPayments(filters)
      .then(({ data }) => setPayments(data))
      .catch(() => setError('Failed to load payments. Check that the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const openPanel = (id: number, type: PanelType) => {
    setPanelId(id);
    setPanelType(type);
    setPanelInput('');
    setActionError('');
  };

  const closePanel = () => {
    setPanelId(null);
    setPanelType(null);
    setPanelInput('');
  };

  const handleMarkPaid = async (id: number) => {
    setActionError('');
    setProcessingId(id);
    try {
      const { data } = await markPaymentPaid(id);
      setPayments(prev => prev.map(p => (p.id === data.id ? data : p)));
    } catch (err) {
      setActionError(extractError(err));
    } finally {
      setProcessingId(null);
    }
  };

  const handlePanelSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (panelId === null || panelType === null) return;
    setPanelSubmitting(true);
    setActionError('');

    try {
      let updated: Payment;
      if (panelType === 'failed') {
        const { data } = await markPaymentFailed(panelId, {
          failureReason: panelInput.trim() || null,
        });
        updated = data;
      } else {
        const { data } = await markPaymentRefunded(panelId, {
          notes: panelInput.trim() || null,
        });
        updated = data;
      }
      setPayments(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      closePanel();
    } catch (err) {
      setActionError(extractError(err));
    } finally {
      setPanelSubmitting(false);
    }
  };

  const panelPayment = payments.find(p => p.id === panelId);

  return (
    <div>
      <div className="page-header">
        <h2>Payments</h2>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s || 'All'}</option>
            ))}
          </select>
        </div>
        {statusFilter && (
          <button className="btn-clear" onClick={() => setStatusFilter('')}>Clear filters</button>
        )}
      </div>

      {panelId !== null && panelPayment && panelType !== null && (
        <div className="form-panel">
          <h3>
            {panelType === 'failed' ? 'Mark as Failed' : 'Mark as Refunded'} — Payment #{panelId}
          </h3>
          {actionError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{actionError}</div>
          )}
          <form onSubmit={handlePanelSubmit}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="form-group">
                <label htmlFor="panel-input">
                  {panelType === 'failed' ? 'Failure Reason' : 'Notes (optional)'}
                </label>
                <textarea
                  id="panel-input"
                  value={panelInput}
                  onChange={e => setPanelInput(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder={
                    panelType === 'failed'
                      ? 'Enter failure reason…'
                      : 'Optional refund notes…'
                  }
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-indigo" disabled={panelSubmitting}>
                {panelSubmitting
                  ? 'Saving…'
                  : panelType === 'failed'
                    ? 'Confirm Failed'
                    : 'Confirm Refunded'}
              </button>
              <button type="button" className="btn-outline" onClick={closePanel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {actionError && panelId === null && (
        <div
          className="alert alert-error"
          style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>{actionError}</span>
          <button
            onClick={() => setActionError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: '0 0.25rem' }}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {loading && <div className="state-message">Loading payments…</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && payments.length === 0 && (
        <div className="state-message">No payments found.</div>
      )}
      {!loading && !error && payments.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Appt.</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Provider</th>
                <th>Status Date</th>
                <th>Notes / Reason</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td className="col-id">
                    <Link to={`/payments/${p.id}`} className="detail-link-id">{p.id}</Link>
                  </td>
                  <td>{p.appointmentId}</td>
                  <td>{p.customerId ?? '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {Number(p.amount).toFixed(2)} {p.currency}
                  </td>
                  <td>
                    <span className={`status-badge status-${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.provider}</td>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {statusDate(p)}
                  </td>
                  <td style={{ fontSize: '0.8rem', maxWidth: '180px' }}>
                    {p.failureReason ? (
                      <span title={p.failureReason}>{truncate(p.failureReason)}</span>
                    ) : p.notes ? (
                      <span title={p.notes}>{truncate(p.notes)}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {formatDateTime(p.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Manual provider — full action set */}
                      {p.provider === 'Manual' && p.status === 'Pending' && (
                        <>
                          <button
                            className="btn-xs activate"
                            disabled={processingId === p.id}
                            onClick={() => handleMarkPaid(p.id)}
                          >
                            {processingId === p.id ? '…' : 'Mark Paid'}
                          </button>
                          <button
                            className="btn-xs deactivate"
                            disabled={processingId === p.id}
                            onClick={() => openPanel(p.id, 'failed')}
                          >
                            Mark Failed
                          </button>
                        </>
                      )}
                      {p.provider === 'Manual' && p.status === 'Paid' && (
                        <button
                          className="btn-xs deactivate"
                          onClick={() => openPanel(p.id, 'refunded')}
                        >
                          Mark Refunded
                        </button>
                      )}
                      {/* Iyzico provider — informational hints only */}
                      {p.provider === 'Iyzico' && p.status === 'Pending' && (
                        <span style={{ fontSize: '0.72rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          Awaiting callback
                        </span>
                      )}
                      {p.provider === 'Iyzico' && p.status === 'Paid' && (
                        <span style={{ fontSize: '0.72rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          Refund not available
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
