import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type {
  ApartmentUnit, CreateApartmentUnitRequest, UpdateApartmentUnitRequest,
  Resident, CreateResidentRequest, UpdateResidentRequest,
  UnitType, ResidentRole,
} from '../types/apartment';
import {
  getApartmentUnits, getApartmentUnit,
  createApartmentUnit, updateApartmentUnit, toggleApartmentUnitActive,
  getApartmentUnitResidents,
  createResident, updateResident, toggleResidentActive,
} from '../api/apartmentsApi';
import { extractError } from '../utils/extractError';

const UNIT_TYPES: UnitType[] = ['Apartment', 'Office', 'Shop', 'Other'];
const RESIDENT_ROLES: ResidentRole[] = ['Owner', 'Tenant', 'FamilyMember', 'Other'];

const EMPTY_UNIT_FORM = {
  blockName: '',
  floorNumber: '',
  doorNumber: '',
  unitType: 'Apartment' as UnitType,
  grossArea: '',
  netArea: '',
  isOccupied: false,
  isActive: true,
  notes: '',
};

const EMPTY_RESIDENT_FORM = {
  fullName: '',
  phone: '',
  email: '',
  role: 'Tenant' as ResidentRole,
  isPrimary: false,
  isActive: true,
  moveInDate: '',
  moveOutDate: '',
  notes: '',
};

export default function ApartmentsPage() {
  // Units
  const [units, setUnits] = useState<ApartmentUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitsError, setUnitsError] = useState('');
  const [toggleUnitError, setToggleUnitError] = useState('');

  // Unit filters
  const [search, setSearch] = useState('');
  const [blockNameFilter, setBlockNameFilter] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState('');
  const [isOccupiedFilter, setIsOccupiedFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');

  // Unit create/edit form
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
  const [unitForm, setUnitForm] = useState(EMPTY_UNIT_FORM);
  const [unitFormError, setUnitFormError] = useState('');
  const [unitFormLoading, setUnitFormLoading] = useState(false);

  // Selected unit + residents panel
  const [selectedUnit, setSelectedUnit] = useState<ApartmentUnit | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentsLoading, setResidentsLoading] = useState(false);
  const [residentsError, setResidentsError] = useState('');
  const [toggleResidentError, setToggleResidentError] = useState('');

  // Resident create/edit form
  const [showResidentForm, setShowResidentForm] = useState(false);
  const [editingResidentId, setEditingResidentId] = useState<number | null>(null);
  const [residentForm, setResidentForm] = useState(EMPTY_RESIDENT_FORM);
  const [residentFormError, setResidentFormError] = useState('');
  const [residentFormLoading, setResidentFormLoading] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────

  const fetchUnits = () => {
    setUnitsLoading(true);
    setUnitsError('');
    getApartmentUnits({
      search: search.trim() || undefined,
      blockName: blockNameFilter.trim() || undefined,
      unitType: (unitTypeFilter as UnitType) || undefined,
      isOccupied: isOccupiedFilter === '' ? undefined : isOccupiedFilter === 'true',
      isActive: isActiveFilter === '' ? undefined : isActiveFilter === 'true',
    })
      .then(({ data }) => setUnits(data))
      .catch(() => setUnitsError('Failed to load units. Check that the backend is running.'))
      .finally(() => setUnitsLoading(false));
  };

  const fetchResidents = (unitId: number) => {
    setResidentsLoading(true);
    setResidentsError('');
    getApartmentUnitResidents(unitId)
      .then(({ data }) => setResidents(data))
      .catch(() => setResidentsError('Failed to load residents.'))
      .finally(() => setResidentsLoading(false));
  };

  useEffect(() => {
    fetchUnits();
  }, [search, blockNameFilter, unitTypeFilter, isOccupiedFilter, isActiveFilter]);

  // ── Unit actions ─────────────────────────────────────────────────

  const openCreateUnit = () => {
    setSelectedUnit(null);
    setShowResidentForm(false);
    setUnitForm(EMPTY_UNIT_FORM);
    setEditingUnitId(null);
    setUnitFormError('');
    setShowUnitForm(true);
  };

  const openEditUnit = (unit: ApartmentUnit) => {
    setSelectedUnit(null);
    setShowResidentForm(false);
    setUnitForm({
      blockName: unit.blockName,
      floorNumber: String(unit.floorNumber),
      doorNumber: unit.doorNumber,
      unitType: unit.unitType,
      grossArea: unit.grossArea !== null ? String(unit.grossArea) : '',
      netArea: unit.netArea !== null ? String(unit.netArea) : '',
      isOccupied: unit.isOccupied,
      isActive: unit.isActive,
      notes: unit.notes ?? '',
    });
    setEditingUnitId(unit.id);
    setUnitFormError('');
    setShowUnitForm(true);
  };

  const cancelUnitForm = () => {
    setShowUnitForm(false);
    setEditingUnitId(null);
    setUnitFormError('');
  };

  const handleUnitSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUnitFormLoading(true);
    setUnitFormError('');
    try {
      const payload: CreateApartmentUnitRequest = {
        blockName: unitForm.blockName.trim(),
        floorNumber: parseInt(unitForm.floorNumber) || 0,
        doorNumber: unitForm.doorNumber.trim(),
        unitType: unitForm.unitType,
        grossArea: unitForm.grossArea.trim() ? parseFloat(unitForm.grossArea) : null,
        netArea: unitForm.netArea.trim() ? parseFloat(unitForm.netArea) : null,
        isOccupied: unitForm.isOccupied,
        isActive: unitForm.isActive,
        notes: unitForm.notes.trim() || null,
      };
      let updated: ApartmentUnit;
      if (editingUnitId === null) {
        const { data } = await createApartmentUnit(payload);
        updated = data;
      } else {
        const { data } = await updateApartmentUnit(editingUnitId, payload as UpdateApartmentUnitRequest);
        updated = data;
      }
      cancelUnitForm();
      fetchUnits();
      if (selectedUnit && selectedUnit.id === updated.id) {
        setSelectedUnit(updated);
      }
    } catch (err) {
      setUnitFormError(extractError(err));
    } finally {
      setUnitFormLoading(false);
    }
  };

  const handleToggleUnit = async (unit: ApartmentUnit) => {
    setToggleUnitError('');
    try {
      const { data } = await toggleApartmentUnitActive(unit.id);
      setUnits(prev => prev.map(u => u.id === data.id ? data : u));
      if (selectedUnit?.id === data.id) setSelectedUnit(data);
    } catch (err) {
      setToggleUnitError(extractError(err));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setBlockNameFilter('');
    setUnitTypeFilter('');
    setIsOccupiedFilter('');
    setIsActiveFilter('');
  };

  const hasFilters = !!(search || blockNameFilter || unitTypeFilter || isOccupiedFilter || isActiveFilter);

  // ── Residents panel ──────────────────────────────────────────────

  const selectUnit = (unit: ApartmentUnit) => {
    setShowUnitForm(false);
    setEditingUnitId(null);
    setUnitFormError('');
    setSelectedUnit(unit);
    setResidents([]);
    setResidentsError('');
    setShowResidentForm(false);
    setEditingResidentId(null);
    setResidentFormError('');
    setToggleResidentError('');
    fetchResidents(unit.id);
  };

  const closeResidentsPanel = () => {
    setSelectedUnit(null);
    setResidents([]);
    setShowResidentForm(false);
    setResidentFormError('');
    setToggleResidentError('');
  };

  // ── Resident actions ─────────────────────────────────────────────

  const openCreateResident = () => {
    setResidentForm(EMPTY_RESIDENT_FORM);
    setEditingResidentId(null);
    setResidentFormError('');
    setShowResidentForm(true);
  };

  const openEditResident = (resident: Resident) => {
    setResidentForm({
      fullName: resident.fullName,
      phone: resident.phone ?? '',
      email: resident.email ?? '',
      role: resident.role,
      isPrimary: resident.isPrimary,
      isActive: resident.isActive,
      moveInDate: resident.moveInDate ? resident.moveInDate.split('T')[0] : '',
      moveOutDate: resident.moveOutDate ? resident.moveOutDate.split('T')[0] : '',
      notes: resident.notes ?? '',
    });
    setEditingResidentId(resident.id);
    setResidentFormError('');
    setShowResidentForm(true);
  };

  const cancelResidentForm = () => {
    setShowResidentForm(false);
    setEditingResidentId(null);
    setResidentFormError('');
  };

  const refreshUnitInList = async (unitId: number) => {
    try {
      const { data } = await getApartmentUnit(unitId);
      setUnits(prev => prev.map(u => u.id === data.id ? data : u));
      if (selectedUnit?.id === data.id) setSelectedUnit(data);
    } catch {
      // silently ignore — resident list is already refreshed
    }
  };

  const handleResidentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    setResidentFormLoading(true);
    setResidentFormError('');
    try {
      if (editingResidentId === null) {
        const payload: CreateResidentRequest = {
          apartmentUnitId: selectedUnit.id,
          fullName: residentForm.fullName.trim(),
          phone: residentForm.phone.trim() || null,
          email: residentForm.email.trim() || null,
          role: residentForm.role,
          isPrimary: residentForm.isPrimary,
          isActive: residentForm.isActive,
          moveInDate: residentForm.moveInDate || null,
          moveOutDate: residentForm.moveOutDate || null,
          notes: residentForm.notes.trim() || null,
        };
        await createResident(payload);
      } else {
        const payload: UpdateResidentRequest = {
          fullName: residentForm.fullName.trim(),
          phone: residentForm.phone.trim() || null,
          email: residentForm.email.trim() || null,
          role: residentForm.role,
          isPrimary: residentForm.isPrimary,
          isActive: residentForm.isActive,
          moveInDate: residentForm.moveInDate || null,
          moveOutDate: residentForm.moveOutDate || null,
          notes: residentForm.notes.trim() || null,
        };
        await updateResident(editingResidentId, payload);
      }
      cancelResidentForm();
      fetchResidents(selectedUnit.id);
      refreshUnitInList(selectedUnit.id);
    } catch (err) {
      setResidentFormError(extractError(err));
    } finally {
      setResidentFormLoading(false);
    }
  };

  const handleToggleResident = async (resident: Resident) => {
    if (!selectedUnit) return;
    setToggleResidentError('');
    try {
      const { data } = await toggleResidentActive(resident.id);
      setResidents(prev => prev.map(r => r.id === data.id ? data : r));
      refreshUnitInList(selectedUnit.id);
    } catch (err) {
      setToggleResidentError(extractError(err));
    }
  };

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div>
      <div className="page-header">
        <h2>Apartment Management</h2>
        {!showUnitForm && (
          <button className="btn-indigo" onClick={openCreateUnit}>Add Unit</button>
        )}
      </div>

      {/* ── Unit create / edit form ──────────────────────────────── */}
      {showUnitForm && (
        <div className="form-panel">
          <h3>{editingUnitId === null ? 'Add Apartment Unit' : 'Edit Apartment Unit'}</h3>
          {unitFormError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{unitFormError}</div>
          )}
          <form onSubmit={handleUnitSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="au-block">Block Name *</label>
                <input
                  id="au-block"
                  type="text"
                  value={unitForm.blockName}
                  onChange={e => setUnitForm(f => ({ ...f, blockName: e.target.value }))}
                  required
                  maxLength={50}
                  placeholder="e.g. A, Block B"
                />
              </div>
              <div className="form-group">
                <label htmlFor="au-floor">Floor Number *</label>
                <input
                  id="au-floor"
                  type="number"
                  value={unitForm.floorNumber}
                  onChange={e => setUnitForm(f => ({ ...f, floorNumber: e.target.value }))}
                  required
                  min={-10}
                  max={200}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="au-door">Door Number *</label>
                <input
                  id="au-door"
                  type="text"
                  value={unitForm.doorNumber}
                  onChange={e => setUnitForm(f => ({ ...f, doorNumber: e.target.value }))}
                  required
                  maxLength={20}
                  placeholder="e.g. 1, 101, A-3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="au-type">Unit Type *</label>
                <select
                  id="au-type"
                  value={unitForm.unitType}
                  onChange={e => setUnitForm(f => ({ ...f, unitType: e.target.value as UnitType }))}
                >
                  {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="au-gross">Gross Area (m²)</label>
                <input
                  id="au-gross"
                  type="number"
                  value={unitForm.grossArea}
                  onChange={e => setUnitForm(f => ({ ...f, grossArea: e.target.value }))}
                  min={0}
                  step={0.01}
                  placeholder="e.g. 120"
                />
              </div>
              <div className="form-group">
                <label htmlFor="au-net">Net Area (m²)</label>
                <input
                  id="au-net"
                  type="number"
                  value={unitForm.netArea}
                  onChange={e => setUnitForm(f => ({ ...f, netArea: e.target.value }))}
                  min={0}
                  step={0.01}
                  placeholder="e.g. 100"
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="au-notes">Notes</label>
                <textarea
                  id="au-notes"
                  value={unitForm.notes}
                  onChange={e => setUnitForm(f => ({ ...f, notes: e.target.value }))}
                  maxLength={1000}
                  rows={2}
                  placeholder="Optional notes"
                />
              </div>
              <div className="form-check">
                <input
                  id="au-occupied"
                  type="checkbox"
                  checked={unitForm.isOccupied}
                  onChange={e => setUnitForm(f => ({ ...f, isOccupied: e.target.checked }))}
                />
                <label htmlFor="au-occupied">Occupied</label>
              </div>
              <div className="form-check">
                <input
                  id="au-active"
                  type="checkbox"
                  checked={unitForm.isActive}
                  onChange={e => setUnitForm(f => ({ ...f, isActive: e.target.checked }))}
                />
                <label htmlFor="au-active">Active</label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-indigo" disabled={unitFormLoading}>
                {unitFormLoading ? 'Saving…' : (editingUnitId === null ? 'Create' : 'Save Changes')}
              </button>
              <button type="button" className="btn-outline" onClick={cancelUnitForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Residents panel ─────────────────────────────────────── */}
      {selectedUnit && (
        <div className="form-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h3>Residents — Block {selectedUnit.blockName} / Door {selectedUnit.doorNumber}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!showResidentForm && (
                <button
                  className="btn-indigo"
                  onClick={openCreateResident}
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.8125rem' }}
                >
                  Add Resident
                </button>
              )}
              <button
                className="btn-outline"
                onClick={closeResidentsPanel}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8125rem' }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Resident create/edit form */}
          {showResidentForm && (
            <>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>
                {editingResidentId === null ? 'Add Resident' : 'Edit Resident'}
              </h4>
              {residentFormError && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{residentFormError}</div>
              )}
              <form onSubmit={handleResidentSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="res-name">Full Name *</label>
                    <input
                      id="res-name"
                      type="text"
                      value={residentForm.fullName}
                      onChange={e => setResidentForm(f => ({ ...f, fullName: e.target.value }))}
                      required
                      maxLength={150}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="res-phone">Phone</label>
                    <input
                      id="res-phone"
                      type="text"
                      value={residentForm.phone}
                      onChange={e => setResidentForm(f => ({ ...f, phone: e.target.value }))}
                      maxLength={30}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="res-email">Email</label>
                    <input
                      id="res-email"
                      type="email"
                      value={residentForm.email}
                      onChange={e => setResidentForm(f => ({ ...f, email: e.target.value }))}
                      maxLength={200}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="res-role">Role *</label>
                    <select
                      id="res-role"
                      value={residentForm.role}
                      onChange={e => setResidentForm(f => ({ ...f, role: e.target.value as ResidentRole }))}
                    >
                      {RESIDENT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="res-movein">Move In Date</label>
                    <input
                      id="res-movein"
                      type="date"
                      value={residentForm.moveInDate}
                      onChange={e => setResidentForm(f => ({ ...f, moveInDate: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="res-moveout">Move Out Date</label>
                    <input
                      id="res-moveout"
                      type="date"
                      value={residentForm.moveOutDate}
                      onChange={e => setResidentForm(f => ({ ...f, moveOutDate: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="res-notes">Notes</label>
                    <textarea
                      id="res-notes"
                      value={residentForm.notes}
                      onChange={e => setResidentForm(f => ({ ...f, notes: e.target.value }))}
                      maxLength={1000}
                      rows={2}
                      placeholder="Optional notes"
                    />
                  </div>
                  <div className="form-check">
                    <input
                      id="res-primary"
                      type="checkbox"
                      checked={residentForm.isPrimary}
                      onChange={e => setResidentForm(f => ({ ...f, isPrimary: e.target.checked }))}
                    />
                    <label htmlFor="res-primary">Primary Resident</label>
                  </div>
                  <div className="form-check">
                    <input
                      id="res-active"
                      type="checkbox"
                      checked={residentForm.isActive}
                      onChange={e => setResidentForm(f => ({ ...f, isActive: e.target.checked }))}
                    />
                    <label htmlFor="res-active">Active</label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-indigo" disabled={residentFormLoading}>
                    {residentFormLoading ? 'Saving…' : (editingResidentId === null ? 'Create' : 'Save Changes')}
                  </button>
                  <button type="button" className="btn-outline" onClick={cancelResidentForm}>
                    Cancel
                  </button>
                </div>
              </form>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '1.25rem 0' }} />
            </>
          )}

          {toggleResidentError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{toggleResidentError}</div>
          )}

          {residentsLoading && (
            <div style={{ color: '#64748b', fontSize: '0.875rem', padding: '0.75rem 0' }}>
              Loading residents…
            </div>
          )}
          {!residentsLoading && residentsError && (
            <div className="alert alert-error">{residentsError}</div>
          )}
          {!residentsLoading && !residentsError && residents.length === 0 && (
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', padding: '0.75rem 0' }}>
              No residents for this unit yet.
            </div>
          )}
          {!residentsLoading && !residentsError && residents.length > 0 && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Primary</th>
                    <th>Active</th>
                    <th>Move In</th>
                    <th>Move Out</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.map(r => (
                    <tr key={r.id}>
                      <td>{r.fullName}</td>
                      <td>{r.role}</td>
                      <td style={{ color: '#64748b' }}>{r.phone ?? '—'}</td>
                      <td style={{ color: '#64748b' }}>{r.email ?? '—'}</td>
                      <td>
                        {r.isPrimary && (
                          <span className="status-badge status-completed">Primary</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${r.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                          {r.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                        {r.moveInDate ? r.moveInDate.split('T')[0] : '—'}
                      </td>
                      <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                        {r.moveOutDate ? r.moveOutDate.split('T')[0] : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn-xs edit" onClick={() => openEditResident(r)}>Edit</button>
                          <button
                            className={`btn-xs ${r.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleResident(r)}
                          >
                            {r.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="filters">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Block, door, notes…"
          />
        </div>
        <div className="filter-group">
          <label>Block</label>
          <input
            type="text"
            value={blockNameFilter}
            onChange={e => setBlockNameFilter(e.target.value)}
            placeholder="e.g. A, Block B"
          />
        </div>
        <div className="filter-group">
          <label>Type</label>
          <select value={unitTypeFilter} onChange={e => setUnitTypeFilter(e.target.value)}>
            <option value="">All types</option>
            {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Occupied</label>
          <select value={isOccupiedFilter} onChange={e => setIsOccupiedFilter(e.target.value)}>
            <option value="">All</option>
            <option value="true">Occupied</option>
            <option value="false">Vacant</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={isActiveFilter} onChange={e => setIsActiveFilter(e.target.value)}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        {hasFilters && (
          <button className="btn-clear" onClick={clearFilters}>Clear</button>
        )}
      </div>

      {toggleUnitError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{toggleUnitError}</div>
      )}

      {unitsLoading && <div className="state-message">Loading units…</div>}
      {!unitsLoading && unitsError && <div className="state-message error">{unitsError}</div>}
      {!unitsLoading && !unitsError && units.length === 0 && (
        <div className="state-message">No apartment units found.</div>
      )}
      {!unitsLoading && !unitsError && units.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Block</th>
                <th>Door No</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Area</th>
                <th>Occupied</th>
                <th>Active</th>
                <th>Residents</th>
                <th>Primary Resident</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map(unit => (
                <tr
                  key={unit.id}
                  style={selectedUnit?.id === unit.id ? { background: '#f5f3ff' } : undefined}
                >
                  <td className="col-id">{unit.id}</td>
                  <td>{unit.blockName}</td>
                  <td>{unit.doorNumber}</td>
                  <td>{unit.floorNumber}</td>
                  <td>{unit.unitType}</td>
                  <td style={{ color: '#64748b' }}>
                    {unit.grossArea !== null ? `${unit.grossArea} m²` : '—'}
                  </td>
                  <td>
                    <span className={`status-badge ${unit.isOccupied ? 'status-confirmed' : 'status-pending'}`}>
                      {unit.isOccupied ? 'Occupied' : 'Vacant'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${unit.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                      {unit.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{unit.residentCount}</td>
                  <td style={{ color: '#64748b' }}>{unit.primaryResidentName ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn-xs stock"
                        onClick={() => selectUnit(unit)}
                        style={selectedUnit?.id === unit.id ? { background: '#6366f1', color: 'white' } : undefined}
                      >
                        Residents
                      </button>
                      <button className="btn-xs edit" onClick={() => openEditUnit(unit)}>Edit</button>
                      <button
                        className={`btn-xs ${unit.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleUnit(unit)}
                      >
                        {unit.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!selectedUnit && !unitsLoading && !unitsError && units.length > 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', marginTop: '1rem' }}>
          Select a unit to manage its residents.
        </div>
      )}
    </div>
  );
}
