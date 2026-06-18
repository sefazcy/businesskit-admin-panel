import { useState } from 'react';
import type { Appointment } from '../types/appointment';
import { getAppointments } from '../api/appointmentsApi';
import { extractError } from '../utils/extractError';
import { Link } from 'react-router-dom';

export default function CustomersPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [results, setResults] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSearch = () => {
    const name = customerName.trim();
    const email = customerEmail.trim();
    const phone = customerPhone.trim();

    if (!name && !email && !phone) {
      setValidationError('Enter at least one search field.');
      return;
    }

    setValidationError('');
    setError('');
    setLoading(true);

    getAppointments({
      customerName: name || undefined,
      customerEmail: email || undefined,
      customerPhone: phone || undefined,
    })
      .then(({ data }) => {
        setResults(data);
        setHasSearched(true);
      })
      .catch(err => {
        setError(extractError(err));
        setHasSearched(true);
      })
      .finally(() => setLoading(false));
  };

  const handleClear = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setResults([]);
    setError('');
    setValidationError('');
    setHasSearched(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Customers</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
          Search appointment records by customer name, email, or phone.
        </p>
      </div>

      <div className="form-panel" style={{ marginTop: '1rem' }}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="search-name">Customer Name</label>
            <input
              id="search-name"
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="search-email">Customer Email</label>
            <input
              id="search-email"
              type="email"
              value={customerEmail}
              onChange={e => setCustomerEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. jane@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="search-phone">Customer Phone</label>
            <input
              id="search-phone"
              type="tel"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. +1 555 0100"
            />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-indigo" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button className="btn-outline" onClick={handleClear}>
            Clear
          </button>
        </div>
        {validationError && (
          <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>{validationError}</div>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>
      )}

      {loading && <div className="state-message">Searching…</div>}

      {!loading && hasSearched && results.length === 0 && !error && (
        <div className="state-message">No appointments found for this customer search.</div>
      )}

      {!loading && results.length > 0 && (
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Staff</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map(a => (
                <tr key={a.id}>
                  <td>{a.requestedDate.split('T')[0]}</td>
                  <td>{a.requestedTime}</td>
                  <td>{a.customerFullName}</td>
                  <td>{a.customerEmail ?? '—'}</td>
                  <td>{a.customerPhone}</td>
                  <td>{a.businessServiceTitle ?? '—'}</td>
                  <td>{a.staffMemberName ?? '—'}</td>
                  <td>
                    <span className={`status-badge status-${a.status.toLowerCase()}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <Link to="/appointments" className="btn-xs edit">
                      View Appointments
                    </Link>
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
