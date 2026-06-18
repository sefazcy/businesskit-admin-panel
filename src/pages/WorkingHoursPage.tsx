import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { getAllStaff } from '../api/staffApi';
import { getWorkingHoursByStaff, createWorkingHour, updateWorkingHour } from '../api/workingHoursApi';
import { extractError } from '../utils/extractError';
import type { StaffMember } from '../types/staff';
import type { StaffWorkingHour } from '../types/workingHours';

const DAYS = [
  { dayOfWeek: 1, dayName: 'Monday' },
  { dayOfWeek: 2, dayName: 'Tuesday' },
  { dayOfWeek: 3, dayName: 'Wednesday' },
  { dayOfWeek: 4, dayName: 'Thursday' },
  { dayOfWeek: 5, dayName: 'Friday' },
  { dayOfWeek: 6, dayName: 'Saturday' },
  { dayOfWeek: 7, dayName: 'Sunday' },
];

const EMPTY_FORM = {
  isWorkingDay: true,
  startTime: '09:00',
  endTime: '17:00',
  breakStartTime: '',
  breakEndTime: '',
};

export default function WorkingHoursPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [workingHours, setWorkingHours] = useState<StaffWorkingHour[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingHours, setLoadingHours] = useState(false);
  const [error, setError] = useState('');
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllStaff()
      .then(({ data }) => setStaff(data))
      .catch(() => setError('Failed to load staff list.'))
      .finally(() => setLoadingStaff(false));
  }, []);

  useEffect(() => {
    if (!selectedStaffId) {
      setWorkingHours([]);
      setEditingDay(null);
      setError('');
      return;
    }
    setLoadingHours(true);
    setError('');
    setEditingDay(null);
    getWorkingHoursByStaff(Number(selectedStaffId))
      .then(({ data }) => setWorkingHours(data))
      .catch(() => setError('Failed to load working hours.'))
      .finally(() => setLoadingHours(false));
  }, [selectedStaffId]);

  const scheduleMap = useMemo(
    () => Object.fromEntries(workingHours.map(h => [h.dayOfWeek, h])) as Record<number, StaffWorkingHour>,
    [workingHours],
  );

  const openEdit = (dayOfWeek: number) => {
    const existing = scheduleMap[dayOfWeek];
    setForm(
      existing
        ? {
            isWorkingDay: existing.isWorkingDay,
            startTime: existing.startTime ?? '',
            endTime: existing.endTime ?? '',
            breakStartTime: existing.breakStartTime ?? '',
            breakEndTime: existing.breakEndTime ?? '',
          }
        : { ...EMPTY_FORM },
    );
    setEditingDay(dayOfWeek);
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingDay(null);
    setFormError('');
  };

  const validate = (): string | null => {
    if (!form.isWorkingDay) return null;
    if (!form.startTime) return 'Start time is required for a working day.';
    if (!form.endTime) return 'End time is required for a working day.';
    if (form.startTime >= form.endTime) return 'Start time must be before end time.';
    const hasBreakStart = !!form.breakStartTime;
    const hasBreakEnd = !!form.breakEndTime;
    if (hasBreakStart !== hasBreakEnd) {
      return 'Both break start and break end are required, or leave both empty.';
    }
    if (hasBreakStart && hasBreakEnd) {
      if (form.breakStartTime >= form.breakEndTime) return 'Break start must be before break end.';
      if (form.breakStartTime < form.startTime) return 'Break start must be within working hours.';
      if (form.breakEndTime > form.endTime) return 'Break end must be within working hours.';
    }
    return null;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError('');

    const staffId = Number(selectedStaffId);
    const existing = scheduleMap[editingDay!];
    const startTime = form.isWorkingDay ? form.startTime || null : null;
    const endTime = form.isWorkingDay ? form.endTime || null : null;
    const breakStartTime = form.isWorkingDay && form.breakStartTime ? form.breakStartTime : null;
    const breakEndTime = form.isWorkingDay && form.breakEndTime ? form.breakEndTime : null;

    try {
      if (existing) {
        await updateWorkingHour(existing.id, {
          dayOfWeek: editingDay!,
          startTime,
          endTime,
          isWorkingDay: form.isWorkingDay,
          breakStartTime,
          breakEndTime,
        });
      } else {
        await createWorkingHour({
          staffMemberId: staffId,
          dayOfWeek: editingDay!,
          startTime,
          endTime,
          isWorkingDay: form.isWorkingDay,
          breakStartTime,
          breakEndTime,
        });
      }
      const { data } = await getWorkingHoursByStaff(staffId);
      setWorkingHours(data);
      setEditingDay(null);
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const editingDayName = DAYS.find(d => d.dayOfWeek === editingDay)?.dayName ?? '';
  const formTitle = editingDay !== null && scheduleMap[editingDay]
    ? `Edit ${editingDayName}`
    : `Configure ${editingDayName}`;

  return (
    <div>
      <div className="page-header">
        <h2>Working Hours</h2>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="staff-select">Staff Member</label>
          <select
            id="staff-select"
            value={selectedStaffId}
            onChange={e => {
              setSelectedStaffId(e.target.value);
              cancelEdit();
            }}
            disabled={loadingStaff}
          >
            <option value="">— Select staff member —</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="state-message error">{error}</div>}

      {!selectedStaffId && !error && (
        <div className="state-message">
          Select a staff member to manage weekly working hours.
        </div>
      )}

      {selectedStaffId && loadingHours && (
        <div className="state-message">Loading working hours…</div>
      )}

      {selectedStaffId && !loadingHours && editingDay !== null && (
        <div className="form-panel">
          <h3>{formTitle}</h3>
          {formError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>
          )}
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-check">
                <input
                  id="wh-is-working"
                  type="checkbox"
                  checked={form.isWorkingDay}
                  onChange={e => setForm(f => ({ ...f, isWorkingDay: e.target.checked }))}
                />
                <label htmlFor="wh-is-working">Working day</label>
              </div>
              <div className="form-group">
                <label htmlFor="wh-start">Start Time</label>
                <input
                  id="wh-start"
                  type="time"
                  value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  disabled={!form.isWorkingDay}
                />
              </div>
              <div className="form-group">
                <label htmlFor="wh-end">End Time</label>
                <input
                  id="wh-end"
                  type="time"
                  value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  disabled={!form.isWorkingDay}
                />
              </div>
              <div className="form-group">
                <label htmlFor="wh-break-start">Break Start</label>
                <input
                  id="wh-break-start"
                  type="time"
                  value={form.breakStartTime}
                  onChange={e => setForm(f => ({ ...f, breakStartTime: e.target.value }))}
                  disabled={!form.isWorkingDay}
                />
              </div>
              <div className="form-group">
                <label htmlFor="wh-break-end">Break End</label>
                <input
                  id="wh-break-end"
                  type="time"
                  value={form.breakEndTime}
                  onChange={e => setForm(f => ({ ...f, breakEndTime: e.target.value }))}
                  disabled={!form.isWorkingDay}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-indigo" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="btn-outline" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedStaffId && !loadingHours && !error && (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Working Hours</th>
                  <th>Break</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map(({ dayOfWeek, dayName }) => {
                  const record = scheduleMap[dayOfWeek];

                  const statusBadge =
                    !record ? (
                      <span className="status-badge status-pending">Not set</span>
                    ) : !record.isWorkingDay ? (
                      <span className="status-badge status-cancelled">Day off</span>
                    ) : (
                      <span className="status-badge status-confirmed">Working</span>
                    );

                  const hoursText =
                    record && record.isWorkingDay
                      ? `${record.startTime} – ${record.endTime}`
                      : '—';

                  const breakText =
                    record && record.isWorkingDay && record.breakStartTime && record.breakEndTime
                      ? `${record.breakStartTime} – ${record.breakEndTime}`
                      : '—';

                  return (
                    <tr key={dayOfWeek}>
                      <td>{dayName}</td>
                      <td>{statusBadge}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{hoursText}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{breakText}</td>
                      <td>
                        <button className="btn-xs edit" onClick={() => openEdit(dayOfWeek)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
            Note: changing working hours does not automatically cancel existing booked appointments.
          </p>
        </>
      )}
    </div>
  );
}
