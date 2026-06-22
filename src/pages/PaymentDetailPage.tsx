import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Payment } from '../types/payment';
import {
  getPaymentById,
  markPaymentPaid,
  markPaymentFailed,
  markPaymentRefunded,
} from '../api/paymentsApi';
import { extractError } from '../utils/extractError';

type PanelType = 'failed' | 'refunded';

function fmt(dt: string | null): string {
  if (!dt) return '—';
  return new Date(dt).toLocaleString();
}

function statusBadgeClass(status: string): string {
  return `status-badge status-${status.toLowerCase()}`;
}

interface TimelineEvent {
  label: string;
  at: string;
}

function buildTimeline(p: Payment): TimelineEvent[] {
  const events: TimelineEvent[] = [{ label: 'Created', at: p.createdAt }];
  if (p.paidAt)     events.push({ label: 'Paid', at: p.paidAt });
  if (p.failedAt)   events.push({ label: 'Failed', at: p.failedAt });
  if (p.refundedAt) events.push({ label: 'Refunded', at: p.refundedAt });
  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const paymentId = id ? parseInt(id, 10) : NaN;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [processingPaid, setProcessingPaid] = useState(false);
  const [actionError, setActionError] = useState('');

  const [panelType, setPanelType] = useState<PanelType | null>(null);
  const [panelInput, setPanelInput] = useState('');
  const [panelSubmitting, setPanelSubmitting] = useState(false);

  useEffect(() => {
    if (isNaN(paymentId)) {
      setLoadError('Invalid payment ID.');
      setLoading(false);
      return;
    }
    getPaymentById(paymentId)
      .then(({ data }) => setPayment(data))
      .catch(() => setLoadError('Payment not found or backend is unavailable.'))
      .finally(() => setLoading(false));
  }, [paymentId]);

  const handleMarkPaid = async () => {
    if (!payment) return;
    setActionError('');
    setProcessingPaid(true);
    try {
      const { data } = await markPaymentPaid(payment.id);
      setPayment(data);
    } catch (err) {
      setActionError(extractError(err));
    } finally {
      setProcessingPaid(false);
    }
  };

  const openPanel = (type: PanelType) => {
    setPanelType(type);
    setPanelInput('');
    setActionError('');
  };

  const closePanel = () => {
    setPanelType(null);
    setPanelInput('');
  };

  const handlePanelSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!payment || panelType === null) return;
    setPanelSubmitting(true);
    setActionError('');
    try {
      let updated: Payment;
      if (panelType === 'failed') {
        const { data } = await markPaymentFailed(payment.id, {
          failureReason: panelInput.trim() || null,
        });
        updated = data;
      } else {
        const { data } = await markPaymentRefunded(payment.id, {
          notes: panelInput.trim() || null,
        });
        updated = data;
      }
      setPayment(updated);
      closePanel();
    } catch (err) {
      setActionError(extractError(err));
    } finally {
      setPanelSubmitting(false);
    }
  };

  const isManual = payment?.provider === 'Manual';
  const isIyzico = payment?.provider === 'Iyzico';

  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/payments" className="btn-back">← Payments</Link>
          <h2 style={{ margin: 0 }}>
            {payment ? `Payment #${payment.id}` : 'Payment Detail'}
          </h2>
        </div>
        {payment && (
          <span className={statusBadgeClass(payment.status)}>{payment.status}</span>
        )}
      </div>

      {/* ── Load states ── */}
      {loading && <div className="state-message">Loading payment…</div>}

      {!loading && loadError && (
        <div className="alert alert-error">
          {loadError}
          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/payments" className="btn-back">← Back to Payments</Link>
          </div>
        </div>
      )}

      {!loading && !loadError && payment && (
        <>
          {/* ── Action error banner ── */}
          {actionError && (
            <div
              className="alert alert-error"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>{actionError}</span>
              <button
                onClick={() => setActionError('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: '0 0.25rem' }}
                aria-label="Dismiss"
              >✕</button>
            </div>
          )}

          {/* ── Details ── */}
          <div className="form-panel">
            <h3>Details</h3>

            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              <div className="form-group">
                <label>Payment ID</label>
                <div className="detail-value">{payment.id}</div>
              </div>
              <div className="form-group">
                <label>Appointment ID</label>
                <div className="detail-value">#{payment.appointmentId}</div>
              </div>
              <div className="form-group">
                <label>Customer ID</label>
                <div className="detail-value">{payment.customerId ?? '—'}</div>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <div className="detail-value">
                  {Number(payment.amount).toFixed(2)} {payment.currency}
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <div className="detail-value">
                  <span className={statusBadgeClass(payment.status)}>{payment.status}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Provider</label>
                <div className="detail-value">{payment.provider}</div>
              </div>
              <div className="form-group">
                <label>Created</label>
                <div className="detail-value detail-value-sm">{fmt(payment.createdAt)}</div>
              </div>
              <div className="form-group">
                <label>Last Updated</label>
                <div className="detail-value detail-value-sm">{fmt(payment.updatedAt)}</div>
              </div>
              {payment.paidAt && (
                <div className="form-group">
                  <label>Paid At</label>
                  <div className="detail-value detail-value-sm">{fmt(payment.paidAt)}</div>
                </div>
              )}
              {payment.failedAt && (
                <div className="form-group">
                  <label>Failed At</label>
                  <div className="detail-value detail-value-sm">{fmt(payment.failedAt)}</div>
                </div>
              )}
              {payment.refundedAt && (
                <div className="form-group">
                  <label>Refunded At</label>
                  <div className="detail-value detail-value-sm">{fmt(payment.refundedAt)}</div>
                </div>
              )}
            </div>

            {/* Notes / Failure reason */}
            {(payment.failureReason || payment.notes) && (
              <div className="form-grid" style={{ gridTemplateColumns: '1fr', marginTop: '0.25rem' }}>
                {payment.failureReason && (
                  <div className="form-group">
                    <label>Failure Reason</label>
                    <div className="detail-value detail-value-wrap">{payment.failureReason}</div>
                  </div>
                )}
                {payment.notes && (
                  <div className="form-group">
                    <label>Notes</label>
                    <div className="detail-value detail-value-wrap">{payment.notes}</div>
                  </div>
                )}
              </div>
            )}

            {/* Provider reference ID */}
            {payment.providerPaymentId && (
              <div className="form-grid" style={{ gridTemplateColumns: '1fr', marginTop: '0.25rem' }}>
                <div className="form-group">
                  <label>Provider Reference ID</label>
                  <div className="detail-value detail-value-mono">{payment.providerPaymentId}</div>
                </div>
              </div>
            )}

            {/* Checkout URL */}
            {payment.providerCheckoutUrl && (
              <div className="form-grid" style={{ gridTemplateColumns: '1fr', marginTop: '0.25rem' }}>
                <div className="form-group">
                  <label>Checkout URL</label>
                  <div className="detail-value">
                    <a
                      href={payment.providerCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-external-link"
                      title={payment.providerCheckoutUrl}
                    >
                      <span className="detail-url-text">{payment.providerCheckoutUrl}</span>
                      <span aria-hidden="true"> ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Timeline ── */}
          <div className="form-panel">
            <h3>Timeline</h3>
            <ul className="detail-timeline">
              {buildTimeline(payment).map(ev => (
                <li key={ev.label} className="detail-timeline-item">
                  <span className="detail-timeline-label">{ev.label}</span>
                  <span className="detail-timeline-at">{fmt(ev.at)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Inline confirmation panel (mark-failed / mark-refunded) ── */}
          {panelType !== null && (
            <div className="form-panel">
              <h3>
                {panelType === 'failed' ? 'Mark as Failed' : 'Mark as Refunded'} — Payment #{payment.id}
              </h3>
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

          {/* ── Actions ── */}
          <div className="form-panel">
            <h3>Actions</h3>

            {/* Manual — Pending */}
            {isManual && payment.status === 'Pending' && (
              <div className="form-actions">
                <button
                  className="btn-indigo"
                  disabled={processingPaid || panelType !== null}
                  onClick={handleMarkPaid}
                >
                  {processingPaid ? 'Processing…' : 'Mark Paid'}
                </button>
                <button
                  className="btn-outline"
                  disabled={processingPaid || panelType !== null}
                  onClick={() => openPanel('failed')}
                >
                  Mark Failed
                </button>
              </div>
            )}

            {/* Manual — Paid */}
            {isManual && payment.status === 'Paid' && (
              <div className="form-actions">
                <button
                  className="btn-outline"
                  disabled={panelType !== null}
                  onClick={() => openPanel('refunded')}
                >
                  Mark Refunded
                </button>
              </div>
            )}

            {/* Manual — terminal or cancelled */}
            {isManual && ['Failed', 'Refunded', 'Cancelled'].includes(payment.status) && (
              <p className="provider-hint">No further actions available for this payment.</p>
            )}

            {/* Iyzico — Pending */}
            {isIyzico && payment.status === 'Pending' && (
              <p className="provider-hint">
                Waiting for provider callback. This payment will update automatically when the customer completes or abandons the Iyzico checkout.
              </p>
            )}

            {/* Iyzico — Paid */}
            {isIyzico && payment.status === 'Paid' && (
              <p className="provider-hint">
                Refund not implemented. Process refunds through the Iyzico merchant dashboard.
              </p>
            )}

            {/* Iyzico — terminal */}
            {isIyzico && ['Failed', 'Refunded', 'Cancelled'].includes(payment.status) && (
              <p className="provider-hint">No further actions available for this payment.</p>
            )}

            {/* Unknown provider */}
            {!isManual && !isIyzico && (
              <p className="provider-hint">
                Manual status changes are not supported for <strong>{payment.provider}</strong> payments.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
