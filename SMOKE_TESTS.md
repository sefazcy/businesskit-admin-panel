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
- [ ] Sidebar shows **Settings** as greyed-out disabled item
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

---

## v2.4 — Appointment Edit Panel + Admin Notes

### Edit Panel

- [ ] Each appointment row has an "Edit" button in the Actions column
- [ ] Clicking "Edit" opens the inline form panel above the table
- [ ] Panel header shows "Edit Appointment #N" with the correct ID
- [ ] All 10 fields are pre-populated from the loaded row
- [ ] Customer Email pre-fills as empty when the stored value is null
- [ ] Staff dropdown pre-selects "None" when `staffMemberId` is null
- [ ] Service dropdown pre-selects "None" when `businessServiceId` is null
- [ ] Date picker pre-fills with the correct date (YYYY-MM-DD)
- [ ] Time picker pre-fills with the correct time (HH:mm)
- [ ] Customer Note pre-fills as empty when the stored value is null
- [ ] Admin Note pre-fills as empty when the stored value is null
- [ ] Status dropdown pre-selects the current status
- [ ] Cancel button closes the panel without sending any request
- [ ] Opening a second Edit after Cancel pre-fills the new row's data (no stale data from the previous edit)

### Save Behaviour

- [ ] Change any field and click "Save Changes" — PUT is sent to `/api/admin/appointments/{id}`
- [ ] Table row updates without a full page reload
- [ ] `staffMemberName` in the row updates when Staff is changed in the edit form
- [ ] `businessServiceTitle` in the row updates when Service is changed in the edit form
- [ ] Stats cards update after save when Status was changed
- [ ] Panel closes after a successful save
- [ ] Backend error (e.g. invalid status, non-existent staff ID) shows an error banner inside the panel — panel stays open

### Null Field Handling

- [ ] Select "None" for Staff, save — row shows "—" and `staffMemberId` is null in DB
- [ ] Select "None" for Service, save — row shows "—" and `businessServiceId` is null in DB
- [ ] Clear Customer Email, save — `customerEmail` sends as `null` (not empty string)
- [ ] Clear Customer Note, save — `note` sends as `null`
- [ ] Clear Admin Note, save — `adminNote` sends as `null`
- [ ] Set Admin Note text, save — adminNote is stored and pre-fills correctly on next Edit click

### Interaction with Change Status Column

- [ ] The quick "Change Status" dropdown in the table row still works after v2.4 changes
- [ ] Changing status via Edit panel also updates the Status badge and Change Status dropdown in the row

### DevTools Checks (Network tab)

- [ ] Inspect PUT body — all 10 fields present: `customerFullName`, `customerEmail`, `customerPhone`, `staffMemberId`, `businessServiceId`, `requestedDate`, `requestedTime`, `note`, `status`, `adminNote`
- [ ] `staffMemberId` sends as a JSON number or `null` (not `""` or `"1"`)
- [ ] `businessServiceId` sends as a JSON number or `null`
- [ ] `customerEmail` sends as `null` when cleared (not `""`)
- [ ] `note` sends as `null` when cleared
- [ ] `adminNote` sends as `null` when cleared
- [ ] `requestedDate` sends as `"YYYY-MM-DD"` string
- [ ] `requestedTime` sends as `"HH:mm"` string

---

## Known Backend Limitations

- **Appointment time conflict not checked on update**: `PUT /api/admin/appointments/{id}` does not re-run the availability/working-hours conflict check that `POST` enforces. An admin can move an appointment to a conflicting time slot without a 400 error. This is known backend behavior to be addressed in a future backend sprint.

---

## v2.5 — Blog Admin Page

### List

- [ ] Navigate to `/blog` — page loads with blog post table (or empty-state message if no posts exist)
- [ ] "Add Post" button is visible when the form panel is not open
- [ ] Language filter text input — typing "en" updates the list to show only English posts
- [ ] Status filter select — selecting "Published" shows only published posts
- [ ] Status filter select — selecting "Draft" shows only draft posts
- [ ] Status filter select — selecting "All" shows all posts
- [ ] Category filter text input — typing a category name filters the list
- [ ] "Clear filters" button appears when any filter is active
- [ ] "Clear filters" resets all three filters and reloads the full list
- [ ] Published posts show a green "Published" badge; drafts show an amber "Draft" badge
- [ ] Published At column shows the date portion (YYYY-MM-DD) or "—" for drafts
- [ ] Blog link in sidebar is active and navigates to `/blog`

### Create

- [ ] "Add Post" opens the inline form panel with all 11 fields empty/default
- [ ] Language field defaults to "en"
- [ ] Is Published checkbox is visible on the create form (unchecked by default)
- [ ] Typing in Title auto-generates the Slug field (e.g. "Hello World" → "hello-world")
- [ ] Manually editing the Slug field stops auto-generation for that session
- [ ] Slug resets to auto-generation when a new "Add Post" form is opened
- [ ] Create with Is Published unchecked — new row appears at top of table with Draft badge
- [ ] Create with Is Published checked — new row appears with Published badge and publishedAt set automatically
- [ ] Create with same slug + language as an existing post — 409 error shown in form, panel stays open
- [ ] Cancel button closes the form without creating anything
- [ ] Content field is required — form does not submit when it is empty

### Edit

- [ ] Click "Edit" on any row — form panel opens with all 11 fields pre-populated
- [ ] Title, Slug, Language, Category, Cover Image URL, SEO Title all pre-fill correctly
- [ ] Is Published checkbox pre-fills to the correct state (checked for published, unchecked for draft)
- [ ] Published At pre-fills correctly for a published post (datetime-local shows correct date + time)
- [ ] Published At pre-fills as empty for a draft post
- [ ] Summary, Content, Meta Description textareas pre-fill correctly (empty when null)
- [ ] Cancel closes the panel without saving
- [ ] Changing Title on edit does NOT re-derive Slug (slug is locked in edit mode)
- [ ] Save changes — row updates in table without page reload
- [ ] Editing a published post without touching Published At — Published At is preserved (not cleared)
- [ ] Changing language on edit + save — language updates in the row

### Publish / Unpublish toggle

- [ ] "Unpublish" button on a Published row — badge changes to Draft without page reload
- [ ] "Publish" button on a Draft row — badge changes to Published; publishedAt is auto-set by backend if it was null
- [ ] Toggling back and forth works repeatedly

### DevTools checks (Network tab)

- [ ] POST body for create contains all 11 fields: `title`, `slug`, `summary`, `content`, `coverImageUrl`, `seoTitle`, `metaDescription`, `category`, `language`, `isPublished`, `publishedAt`
- [ ] PUT body for update contains the same 11 fields
- [ ] `language` sends as lowercase string (e.g. `"en"` not `"EN"`)
- [ ] `isPublished` sends as JSON boolean (`true`/`false`), not a string
- [ ] `publishedAt` sends as `null` when the field is empty; as an ISO string when set
- [ ] `summary`, `coverImageUrl`, `seoTitle`, `metaDescription`, `category` send as `null` when cleared (not `""`)
- [ ] PATCH `/publish` sends no request body
- [ ] PATCH `/unpublish` sends no request body

### Known Blog Limitations

- [ ] No delete endpoint exists — posts cannot be deleted from the admin panel
- [ ] Language field accepts any string up to 10 chars with no enum validation — always use lowercase (e.g. `en`, `tr`)
- [ ] Unpublishing a post does NOT clear `publishedAt` — this is intentional backend behavior

---

## v2.6 — Gallery Admin Page

### List

- [ ] Navigate to `/gallery` — page loads with gallery table (or empty-state message if no items exist)
- [ ] "Add Item" button is visible when the form panel is not open
- [ ] Category filter text input — typing a category name filters the list
- [ ] Status filter select — selecting "Active" shows only active items
- [ ] Status filter select — selecting "Inactive" shows only inactive items
- [ ] Status filter select — selecting "All" shows all items
- [ ] "Clear filters" button appears when any filter is active
- [ ] "Clear filters" resets both filters and reloads the full list
- [ ] Active items show a green "Active" badge; inactive items show an amber "Inactive" badge
- [ ] Image thumbnail column renders a 40×40 image for items with a valid imageUrl
- [ ] If an image URL is broken/unreachable the thumbnail cell does not show a broken-image icon (hidden via onError)
- [ ] Gallery link in sidebar is active and navigates to `/gallery`
- [ ] **No Delete button exists** anywhere on the page

### Create (manual image URL)

- [ ] "Add Item" opens the inline form panel with all fields empty / Display Order defaulting to 0
- [ ] Active checkbox is **NOT visible** on the create form
- [ ] Fill Title and a direct image URL, submit — new row appears at the top of the table with Active badge
- [ ] Image thumbnail in the new row matches the URL entered
- [ ] Cancel button closes the form without creating anything
- [ ] Title field is required — form does not submit when empty
- [ ] Image URL field is required — form does not submit when empty

### Create (file upload)

- [ ] Clicking "Upload Image" opens the file picker
- [ ] Selecting a valid `.jpg`/`.png`/`.webp` under 5 MB — "Uploading…" appears on the button, then the Image URL field is filled with the returned `url` value
- [ ] A preview thumbnail appears below the Image URL field after a successful upload
- [ ] After upload completes, submitting the form creates the item with the uploaded image URL
- [ ] Selecting a file larger than 5 MB — client-side error "Image file size must not exceed 5 MB." is shown; no upload request is sent
- [ ] Selecting an unsupported extension (e.g. `.gif`) — backend returns a 400 error which is shown in the form error banner
- [ ] After a failed upload the Image URL field is unchanged; user can retry or type manually

### Edit

- [ ] Click "Edit" on any row — form panel opens with all fields pre-populated
- [ ] Title, Image URL, Category, Description all pre-fill correctly
- [ ] Display Order pre-fills with the correct integer
- [ ] **Active checkbox IS visible on the edit form**
- [ ] Active checkbox pre-fills to the correct state (active item → checked; inactive → unchecked)
- [ ] Cancel closes the panel without saving
- [ ] Change a field and save — table row reflects the updated values without page reload
- [ ] Edit an active item, leave Active checked, change only Title, save — item remains Active (isActive not silently cleared)
- [ ] Edit an active item, uncheck Active, save — row badge changes to Inactive

### Toggle Active

- [ ] "Deactivate" button on an active row — badge toggles to Inactive without page reload
- [ ] "Activate" button on an inactive row — badge toggles to Active without page reload
- [ ] Toggling back and forth works repeatedly

### Image preview

- [ ] If the uploaded image URL is relative (starts with `/`), the preview thumbnail in the form resolves it against `http://localhost:5299` and displays correctly
- [ ] If the image URL is an absolute `https://` URL it displays as-is in both the form preview and the table thumbnail

### DevTools checks (Network tab)

- [ ] POST body for create contains exactly 5 fields: `title`, `description`, `imageUrl`, `category`, `displayOrder` — **`isActive` is absent**
- [ ] PUT body for update contains exactly 6 fields: `title`, `description`, `imageUrl`, `category`, `isActive`, `displayOrder`
- [ ] `description` and `category` send as `null` when cleared (not `""`)
- [ ] `displayOrder` sends as a JSON number literal (e.g. `0`), not a string
- [ ] `isActive` sends as JSON boolean (`true`/`false`), not a string
- [ ] Upload request sends as `multipart/form-data` with the file under field name `file`
- [ ] PATCH toggle-active sends no request body

### Auth

- [ ] Log out, navigate to `/gallery` — redirected to `/login`
- [ ] After logout, pressing back does not restore the gallery page with data

### Known Gallery Limitations

- [ ] No delete endpoint exists — items can only be deactivated, not removed
- [ ] Creating an item while a filter is active may show the new item in the list even if it does not match the current filter — this is a known optimistic-update limitation
