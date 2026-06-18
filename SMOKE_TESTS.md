# BusinessKit Admin Panel — Smoke Tests

Manual smoke test checklist. Run after each release against a live backend at `http://localhost:5299`.

---

## Login

- [ ] Navigate to `http://localhost:5173/login` — login form is shown
- [ ] Submit with wrong credentials — error message appears, no redirect
- [ ] Submit with `admin@businesskit.local` / `Admin123!` — redirects to `/dashboard`
- [ ] Refresh while on `/dashboard` — stays logged in (token persisted in localStorage)
- [ ] Navigate directly to `/login` while already logged in — redirects to `/dashboard`

---

## Dashboard

- [ ] Welcome message shows the logged-in user's full name
- [ ] **Backend** card shows "Connected"
- [ ] **Appointments** card shows "Module active"
- [ ] **Staff** card shows "Module active"
- [ ] **Services** card shows "Module active"
- [ ] **Blog** and **Gallery** cards show "Coming soon"

---

## Appointments

- [ ] Navigate to `/appointments` — table loads with data from the backend
- [ ] Status filter — table updates correctly when a status is selected
- [ ] Date filter — table updates correctly when a date is selected
- [ ] Both filters active simultaneously — table reflects both
- [ ] "Clear filters" button appears when either filter is active
- [ ] "Clear filters" click resets both filters and reloads all rows
- [ ] Empty state message shown when no rows match the active filters

---

## Staff

- [ ] Navigate to `/staff` — table loads (or empty-state message if no staff exist)
- [ ] "Add Staff" button opens the inline form panel
- [ ] Typing in Full Name auto-generates the Slug field (`Jane Doe` → `jane-doe`)
- [ ] Manually editing Slug field stops auto-generation for that session
- [ ] Slug field resets to auto-generation when a new "Add Staff" form is opened
- [ ] Create a staff member — member appears in the table after save
- [ ] Click Edit on an existing member — form pre-populates with all visible fields
- [ ] Change a field and save — table row reflects the updated values
- [ ] Cancel button closes the form without making any changes
- [ ] Display Order field can be fully cleared and a new integer typed without showing leading zeros
- [ ] Active checkbox defaults to checked on new staff
- [ ] Uncheck Active, save — badge shows "Inactive"
- [ ] "Deactivate" button on an active row — badge toggles to Inactive without page reload
- [ ] "Activate" button on an inactive row — badge toggles to Active without page reload

---

## Services

- [ ] Navigate to `/services` — table loads (or empty-state message if no services exist)
- [ ] "Add Service" button opens the inline form panel
- [ ] Typing in Title auto-generates the Slug field (`Hair Cut` → `hair-cut`)
- [ ] Manually editing Slug field stops auto-generation for that session
- [ ] **Active checkbox is NOT visible on the create form**
- [ ] Create a service — service appears in the table after save
- [ ] Price field can be fully cleared and a decimal typed (e.g. `25.50`) without artifacts
- [ ] Duration field can be fully cleared and a new integer typed
- [ ] Display Order field can be fully cleared and a new integer typed
- [ ] Click Edit on an existing service — form pre-populates with all visible fields
- [ ] **Active checkbox IS visible on the edit form**
- [ ] Edit form pre-populates Active state correctly (active service → checkbox checked)
- [ ] Change a field and save — table row reflects the updated values
- [ ] Cancel button closes the form without making any changes
- [ ] "Deactivate" button on an active row — badge toggles to Inactive without page reload
- [ ] "Activate" button on an inactive row — badge toggles to Active without page reload
- [ ] Price displays with two decimal places in the table (e.g. `25.00`)
- [ ] Duration displays with "min" suffix in the table (e.g. `30 min`)

---

## Layout / Auth

- [ ] Sidebar shows **Staff** and **Services** as active, clickable links
- [ ] Sidebar shows **Blog**, **Gallery**, **Settings** as greyed-out disabled items
- [ ] Active page link has the indigo left-border highlight
- [ ] Topbar shows the logged-in user's full name
- [ ] Logout button clears the session and redirects to `/login`
- [ ] After logout, navigating to `/dashboard` redirects to `/login`
- [ ] After logout, navigating to `/staff` redirects to `/login`
- [ ] After logout, navigating to `/services` redirects to `/login`

---

## Known Manual Checks

These require deliberate input or DevTools verification.

- [ ] **Duplicate slug — Staff**: Create a staff member, then attempt to create another with the exact same slug — form should display the 409 backend error message, not a generic error
- [ ] **Duplicate slug — Services**: Same test for services
- [ ] **Staff edit preserves isActive**: Open edit for an active staff member, change only the Full Name, save — member remains Active (not silently deactivated)
- [ ] **Service edit preserves isActive**: Open edit for an active service, change only the Title, save — service remains Active
- [ ] **Service create does not send isActive**: Open DevTools → Network, submit a new service create, inspect the POST `/api/admin/services` request body — confirm `isActive` is **absent**
- [ ] **Price submits as JSON number**: In DevTools Network, inspect the service create/update request body — `price` must be a number literal (e.g. `25.5`), not a string (`"25.5"`)
- [ ] **durationMinutes submits as JSON number**: Same check — `durationMinutes` must be a number literal
- [ ] **displayOrder submits as JSON number**: Same check for both staff and services — `displayOrder` must be a number literal
- [ ] **Logout then back navigation**: Log out, then press the browser back button — should not restore a logged-in session; `/staff` should redirect to `/login`

---

## v2.3 — Appointment Admin Actions

### Stats Cards

- [ ] Stats cards appear at the top of `/appointments` after page load
- [ ] Cards show: Total, Pending, Confirmed, Cancelled, Completed, Today, Next 7 Days
- [ ] Stats reflect the real backend counts (verify against known data)
- [ ] Stats are global — they do not change when the status filter is applied (status is not a stats endpoint param)
- [ ] After changing an appointment status via the row dropdown, stats cards update to reflect the new counts

### Staff Filter

- [ ] Staff dropdown in filter bar is populated with staff names from the backend
- [ ] Selecting a staff member filters the table to show only their appointments
- [ ] Selecting "All" in the staff dropdown removes the staff filter
- [ ] Staff filter works in combination with status and date filters

### Service Filter

- [ ] Service dropdown in filter bar is populated with service titles from the backend
- [ ] Selecting a service filters the table to show only appointments for that service
- [ ] Selecting "All" in the service dropdown removes the service filter
- [ ] Service filter works in combination with status and date filters

### Status Update (Inline)

- [ ] Each appointment row has a "Change Status" dropdown showing the current status
- [ ] Selecting a different status from the dropdown immediately calls PATCH `/api/admin/appointments/{id}/status`
- [ ] The Status badge in the same row updates without page reload
- [ ] Refreshing the page after a status change shows the new status (persisted to backend)
- [ ] Stats cards update after a successful status change
- [ ] Changing a status to the same value does nothing (no request is sent)
- [ ] If the PATCH fails, an error banner appears above the table with the backend error message
- [ ] Error banner can be dismissed with the ✕ button

### Admin Note Preservation

- [ ] Open DevTools → Network, change status on an appointment that has no admin note — `adminNote` in the PATCH body should be `null`
- [ ] If an appointment already has an `adminNote` value, the PATCH body should send that same `adminNote` value (not overwrite it with `null`)

### Known Manual Checks — Appointments v2.3

- [ ] **staffMemberId sends as number**: Inspect the GET `/api/admin/appointments` request with staff filter active — `staffMemberId` query param must be a number (e.g. `1`), not a string (`"1"`)
- [ ] **businessServiceId sends as number**: Same for service filter — `businessServiceId` must be a number
- [ ] **Clear filters resets all four dropdowns**: Apply all four filters, click "Clear filters" — all four selects reset to "All"/"empty" and the table reloads unfiltered
