# BusinessKit Admin Panel — Smoke Tests

Manual smoke test checklist. Run after each release against a live backend at `http://localhost:5299`.

---

## Login

- [ ] Navigate to `http://localhost:5173/login` — login form is shown
- [ ] Submit with wrong credentials — error message appears, no redirect
- [ ] Submit with `admin@businesskit.local` / `Admin123!` — redirects to `/dashboard`
- [ ] Refresh while on `/dashboard` — stays logged in (token persisted in localStorage)
- [ ] Navigate directly to `/login` while already logged in — redirects to `/dashboard` (LoginPage returns `<Navigate to="/dashboard" />` when `isAuthenticated` is true)

---

## Dashboard

- [ ] Welcome message shows the logged-in user's full name
- [ ] **Backend** card shows "Connected"
- [ ] **Appointments** card shows "Module active"
- [ ] **Staff** card shows "Module active"
- [ ] **Services** card shows "Module active"
- [ ] All implemented module cards (Appointments, Staff, Services, Blog, Gallery, Messages, Settings) show "Module active"

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
- [ ] Sidebar shows **Settings** as an active, clickable NavLink
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

---

## v2.7 — Contact Messages Admin Page

### List

- [ ] Navigate to `/messages` — page loads with messages table (or empty-state message if no messages exist)
- [ ] Sidebar shows **Messages** as an active, clickable link
- [ ] Dashboard shows a **Messages** card with "Module active"
- [ ] Dashboard shows **Blog** and **Gallery** cards with "Module active" (no longer "Coming soon")
- [ ] Table columns present: ID, From, Email, Subject, Date, Status, Actions
- [ ] Unread messages show an amber "Unread" badge in the Status column
- [ ] Read messages show a green "Read" badge in the Status column
- [ ] Replied messages show a blue "Replied" badge alongside the Read/Unread badge
- [ ] Archived messages show a red/grey "Archived" badge
- [ ] Unread message rows show the sender name in **bold**; read rows show it in normal weight
- [ ] **No Add button exists** on the page
- [ ] **No Delete button exists** anywhere on the page

### Filters

- [ ] Check "Unread only" — list reloads showing only unread messages
- [ ] Uncheck "Unread only" — all messages return
- [ ] Check "Archived only" — list reloads showing only archived messages
- [ ] Both filters checked simultaneously — list reloads with both params applied
- [ ] "Clear filters" button appears when any filter is active
- [ ] Clicking "Clear filters" resets both checkboxes and reloads the unfiltered list

### DevTools checks — filter params

- [ ] With "Unread only" checked: GET request includes `?unreadOnly=true`
- [ ] With "Archived only" checked: GET request includes `?archivedOnly=true`
- [ ] With no filters active: GET request has **no** `unreadOnly` or `archivedOnly` query params (not sent as `false`)

### View / Detail panel

- [ ] Clicking "View" on any row opens the detail panel above the table
- [ ] Panel header shows "Message #N" with the correct ID
- [ ] Full Name, Email, Phone (or —), Subject (or —) all display correctly
- [ ] Full message body is visible in a styled block — long text wraps, not truncated
- [ ] Line breaks in the message body are preserved (white-space: pre-wrap)
- [ ] IP Address displays correctly (or — if null)
- [ ] Received datetime shows a human-readable locale string
- [ ] Updated datetime shows a human-readable locale string
- [ ] Clicking "View" on a different row while panel is open — panel updates to the new message (no stale data)
- [ ] Close button closes the panel

### Mark Read / Unread

- [ ] Open detail panel for an unread message — "Mark as Read" button is shown
- [ ] Click "Mark as Read" — table row badge changes from "Unread" to "Read" without page reload
- [ ] Panel button changes to "Mark as Unread" after the action
- [ ] Click "Mark as Unread" — table row badge reverts to "Unread"; panel button reverts to "Mark as Read"
- [ ] Toggling back and forth works repeatedly

### Mark as Replied

- [ ] Open detail panel for an unreplied message — "Mark as Replied" button is visible and enabled
- [ ] Click "Mark as Replied" — table row gains "Replied" badge; button disappears from the panel
- [ ] Re-open the panel for the same message — "Mark as Replied" button is absent (one-way, permanent)

### Archive / Unarchive

- [ ] Click "Archive" in detail panel — table row gains "Archived" badge; button changes to "Unarchive"
- [ ] Click "Unarchive" in detail panel — "Archived" badge removed; button changes back to "Archive"
- [ ] With "Archived only" filter active: after unarchiving, the list refetches and the row disappears
- [ ] With "Unread only" filter active: after marking read, the list refetches and the row disappears

### Action error handling

- [ ] If a PATCH action fails, an error banner appears inside the detail panel
- [ ] The panel stays open after a failed action
- [ ] The error banner is not shown when no error has occurred

### Auth

- [ ] Log out, navigate to `/messages` — redirected to `/login`
- [ ] After logout, pressing back does not restore the messages page with data

### DevTools checks — actions

- [ ] All PATCH requests (`mark-read`, `mark-unread`, `mark-replied`, `archive`, `unarchive`) send no request body
- [ ] PATCH response updates the matching row in the table without a full page reload
- [ ] `isRead`, `isReplied`, `isArchived` arrive as JSON booleans in the response

### Known Message Limitations

- [ ] No delete endpoint exists — messages cannot be removed from the admin panel
- [ ] No pagination — all messages load in a single request; performance degrades with high volume
- [ ] No search — cannot filter by sender name, email, or message content
- [ ] `mark-replied` is one-way — once a message is marked as replied it cannot be un-replied

---

## v2.8 — Business Settings Admin Page

### Page load

- [ ] Navigate to `/settings` — page loads (loading spinner shown briefly)
- [ ] Settings link in sidebar is active and highlighted
- [ ] Dashboard shows a **Settings** card with "Module active"
- [ ] If settings have never been saved: all fields are empty, Currency defaults to "USD", subtitle reads "Settings not yet configured. Fill in and save to create." — **no error is shown**
- [ ] If settings exist: all 14 fields are pre-filled from the current values
- [ ] Subtitle shows "Last saved: {human-readable datetime}" when settings exist

### Form sections and fields

- [ ] **Business Info** section is visible with: Business Name, Phone, Email, Currency, Address (textarea), Working Hours (textarea)
- [ ] **Online Presence** section is visible with: Website, Logo URL
- [ ] **Social Links** section is visible with: Instagram, LinkedIn, Facebook, Twitter, WhatsApp
- [ ] **Appearance** section is visible with: Theme Color
- [ ] All 14 writable fields are visible on the page
- [ ] No tabs, no toggles — single scrollable form

### Save — first time (creates settings record)

- [ ] Fill in Business Name and leave everything else blank, click "Save Settings"
- [ ] PUT request is sent to `/api/admin/business-settings`
- [ ] Green success banner "Settings saved successfully." appears
- [ ] Subtitle changes to "Last saved: {datetime}"
- [ ] Navigate away and back — Business Name value persists (stored on backend)

### Save — update existing settings

- [ ] Change Business Name and Phone, click "Save Settings" — success banner appears, values persist after page refresh
- [ ] Blank out an optional field (e.g. Phone), save — field is cleared on backend (next page load shows it empty)

### Required field validation

- [ ] Clear Business Name entirely, click Save — error shown, no API call made
- [ ] Clear Currency entirely, click Save — error shown, no API call made
- [ ] Both validations fire client-side before the PUT request

### Null / empty string handling (DevTools Network tab)

- [ ] Clear Phone, submit — PUT body contains `"phone": null` (not `"phone": ""`)
- [ ] Clear Email, submit — PUT body contains `"email": null`
- [ ] Clear all Social Links, submit — all five social fields send as `null`
- [ ] Clear Logo URL, submit — `"logoUrl": null`
- [ ] Clear Working Hours, submit — `"workingHours": null`
- [ ] Clear Theme Color, submit — `"themeColor": null`
- [ ] PUT body always contains all 14 writable fields (no field is ever omitted)

### Email validation

- [ ] Enter an invalid email (e.g. `notanemail`), click Save — backend returns 400; error banner appears, success banner does not show
- [ ] Clear email (blank), click Save — no email validation error (sends `null`, which is valid)

### Success / error banner behavior

- [ ] After a successful save, green success banner is visible
- [ ] Editing any field after a successful save causes the green success banner to disappear
- [ ] If save fails (e.g. invalid email), red error banner is shown; green success banner is not shown
- [ ] Error banner disappears on next successful save

### Auth

- [ ] Log out, navigate to `/settings` — redirected to `/login`
- [ ] Note: the GET `/api/business-settings` used to load the form is a public endpoint — settings values are readable without auth. Only the PUT requires auth.

### Known Settings Limitations

- [ ] No partial update — every save replaces all 14 fields; any field not present in the UI would be nulled (currently all 14 are present)
- [ ] No logo upload UI — logo must be entered as a URL string manually
- [ ] No theme color picker — hex/color value must be typed manually
- [ ] Working Hours is free text with no format enforcement

---

## v2.9 — Admin Panel Stabilization & Polish

### Build & routes

- [ ] `npm run build` completes with zero TypeScript errors and zero warnings
- [ ] All 8 routes still load: `/dashboard`, `/appointments`, `/staff`, `/services`, `/blog`, `/gallery`, `/messages`, `/settings`
- [ ] All 8 sidebar NavLinks are active and navigate correctly — no disabled stubs
- [ ] Dashboard shows all 8 cards as "Module active"
- [ ] No route or sidebar regressions introduced

### Shared extractError utility

- [ ] `src/utils/extractError.ts` exists and exports a single `extractError(err: unknown): string` function
- [ ] None of the following page files define a local `extractError` function: AppointmentsPage, StaffPage, ServicesPage, BlogPage, GalleryPage, MessagesPage, SettingsPage
- [ ] All seven pages import `extractError` from `'../utils/extractError'`
- [ ] Submit a form with a field that triggers ASP.NET ModelState validation (e.g. empty required field) — the exact validation message from the backend appears in the form error banner, not "An unexpected error occurred."

### Appointments — page header layout

- [ ] Navigate to `/appointments` — the "Appointments" heading is wrapped in a `page-header` div, consistent with all other pages
- [ ] The stats cards row appears directly below the header (no layout regression)
- [ ] Status change error still surfaces as a dismissible red banner above the table

### Staff — isActive checkbox visibility

- [ ] Click "Add Staff" to open the create form — **no Active checkbox is visible**
- [ ] Fill in required fields and create a staff member — member is created (backend defaults to active)
- [ ] Click "Edit" on an existing staff member — **Active checkbox IS visible** and pre-filled correctly
- [ ] Unchecking Active on edit and saving — the staff member becomes inactive in the table

### Staff — toggle error feedback

- [ ] Simulate a toggle failure (e.g. disconnect backend, click Deactivate) — a red error banner appears above the table
- [ ] The banner text reflects the actual error, not a generic fallback (when backend provides a message)
- [ ] Successfully toggling clears any previous toggle error banner

### Services — toggle error feedback

- [ ] Simulate a toggle failure (e.g. disconnect backend, click Deactivate) — a red error banner appears above the table
- [ ] The banner text is not empty
- [ ] Successfully toggling clears any previous toggle error banner

### Gallery — inactive badge colour

- [ ] Active gallery items show a green "Active" badge (`status-confirmed`)
- [ ] **Inactive gallery items show a red "Inactive" badge (`status-cancelled`)** — not amber/pending
- [ ] Toggling an item from active to inactive changes its badge from green to red

### Gallery — toggle error feedback

- [ ] Simulate a toggle failure — a red error banner appears above the gallery table
- [ ] Successfully toggling clears any previous toggle error banner

### Messages — action error feedback

- [ ] Open a message detail panel
- [ ] Simulate an action failure (e.g. disconnect backend, click Mark as Read) — a red error banner appears inside the detail panel
- [ ] The panel remains open after the failure
- [ ] A successful action on the same message clears the error banner

### Existing flows — no regressions

- [ ] Staff: create, edit, and Activate/Deactivate all still work end-to-end
- [ ] Services: create, edit, and Activate/Deactivate all still work end-to-end
- [ ] Blog: create, edit, Publish/Unpublish all still work end-to-end
- [ ] Gallery: create, edit, Upload Image, Activate/Deactivate all still work end-to-end
- [ ] Messages: Mark as Read/Unread, Mark as Replied, Archive/Unarchive all still work end-to-end
- [ ] Settings: save still works and shows the green success banner
- [ ] Appointments: status change and edit save still work; errors surface correctly

### No backend changes

- [ ] No backend files were modified
- [ ] No new migrations exist

---

## v3.0 — Admin Panel MVP Release Checkpoint

### Build

- [ ] `npm run build` completes with zero TypeScript errors and zero Vite warnings
- [ ] No `console.log` or debug statements in `src/`
- [ ] Bundle size is under 500 kB gzipped JS (expected ~100 kB)

### Auth

- [ ] Navigate to `http://localhost:5173/login` — login form is shown
- [ ] Submit with wrong credentials — error message appears, no redirect
- [ ] Submit with `admin@businesskit.local` / `Admin123!` — redirects to `/dashboard`
- [ ] Refresh while on `/dashboard` — stays logged in (token persisted in localStorage)
- [ ] Navigate directly to `/login` while already logged in — redirects to `/dashboard` immediately
- [ ] Log out — redirects to `/login`; navigating to any protected route redirects back to `/login`

### Routes and sidebar

- [ ] All 8 sidebar NavLinks are active and navigate correctly: Dashboard, Appointments, Staff, Services, Blog, Gallery, Messages, Settings
- [ ] No disabled or greyed-out sidebar stubs
- [ ] Active page link has the indigo left-border highlight
- [ ] Unknown URL (e.g. `/nonexistent`) redirects to `/dashboard`

### Dashboard

- [ ] Welcome message shows the logged-in user's full name
- [ ] **Backend** card shows "Connected"
- [ ] All 8 module cards (Appointments, Staff, Services, Blog, Gallery, Messages, Settings) show "Module active"

### Appointments

- [ ] List loads; filters (status, staff, service, date) work; clear filters resets all four
- [ ] Stats cards update after a status change
- [ ] Inline status dropdown changes status without page reload
- [ ] Edit panel saves all fields; table row updates without reload
- [ ] Errors surface via banner (status change error and edit form error)

### Staff

- [ ] Create, edit, activate/deactivate all work end-to-end
- [ ] Toggle error surfaces as a red banner above the table

### Services

- [ ] Create, edit, activate/deactivate all work end-to-end
- [ ] Toggle error surfaces as a red banner above the table

### Blog

- [ ] Create, edit all work end-to-end
- [ ] Publish / Unpublish toggle updates the badge without page reload
- [ ] **If publish/unpublish fails (backend down), a red error banner appears above the table** — this was a known silent-failure bug fixed in v3.0
- [ ] Error banner disappears on the next successful toggle

### Gallery

- [ ] Create (manual URL), edit, activate/deactivate all work end-to-end
- [ ] File upload path: select valid image → URL auto-fills → form submits → row appears with image thumbnail
- [ ] Client-side 5 MB guard: selecting an oversized file shows an error before upload
- [ ] Toggle error surfaces as a red banner above the table

### Messages

- [ ] View detail panel, Mark Read/Unread, Mark Replied, Archive/Unarchive all work end-to-end
- [ ] Action error surfaces as a banner inside the detail panel

### Settings

- [ ] Settings load on mount; all fields pre-fill from backend
- [ ] Save shows green success banner; editing a field after save clears it
- [ ] Required-field validation (Business Name, Currency) fires client-side before PUT

### Shared utilities

- [ ] None of the page files define a local `extractError` — all import from `../utils/extractError`
- [ ] Submitting a form with a field that triggers backend validation shows the exact backend message, not "An unexpected error occurred."

### Release gate

- [ ] Working tree is clean (`git status` shows no modified or untracked files)
- [ ] Tag `v3.0` created and pushed

---

## Known System Limitations

These are documented limitations accepted for v3.0 MVP. They are not bugs.

- **API base URL hardcoded** — `apiClient.ts` has `baseURL: 'http://localhost:5299'`; environment variable migration (`VITE_API_URL`) is deferred post-v3.0
- **Gallery image preview base hardcoded** — `GalleryPage.tsx` resolves relative image URLs against `http://localhost:5299`; same env migration deferred
- **No 401 auto-logout** — no axios response interceptor exists; an expired token causes API error banners on individual pages rather than a redirect to `/login`
- **Token presence, not validity** — `isAuthenticated` is `!!token`; a stored but expired token will appear as authenticated until an API call fails
- **No role-based frontend enforcement** — any account with valid credentials can access the admin panel; admin role is stored but not checked client-side
- **Dashboard uses multiple parallel requests** — 9 calls run in parallel at load; a dedicated backend aggregate endpoint can be added later for efficiency
- **No pagination** — all list endpoints return all records in a single request; performance degrades with high data volume
- **No search** — no full-text or field-level search in any module
- **No delete actions** — modules without backend delete endpoints (Blog, Gallery, Messages) cannot remove records; deactivate/archive is the only available action
- **Admin panel is desktop-first** — sidebar is a fixed 220 px column with no mobile collapse; not designed for small viewports
- **No automated tests** — manual smoke tests (this document) are the sole release gate

---

## v3.1 — Real Dashboard Stats

### Dashboard load

- [ ] Navigate to `/dashboard` — a brief "Loading dashboard…" message is shown while data fetches
- [ ] After load, all stat cards render with real numbers (not "Module active" text)
- [ ] Page does not crash or show a blank screen even if one endpoint is slow or fails

### Backend status card

- [ ] **Backend: Connected** — card shows "Connected" in green when `GET /api/health` returns 200
- [ ] **Backend: Offline** — with backend stopped, card shows "Offline" in red
- [ ] Backend card is not clickable (no link wrapper)

### Appointment stats

- [ ] **Today's Appointments** card count matches the "Today" count shown in the AppointmentsPage stats row
- [ ] **Pending** card count matches the "Pending" count shown in the AppointmentsPage stats row; displayed in amber when > 0
- [ ] **Upcoming 7 Days** card count matches the AppointmentsPage "Next 7 Days" stat

### Unread messages

- [ ] **Unread Messages** card count matches the number of rows when "Unread only" filter is active on the Messages page
- [ ] Count shows in amber when > 0; neutral when 0

### Module stats

- [ ] **Active Staff** count matches the number of staff members with Active badge on the Staff page
- [ ] **Active Services** count matches the number of services with Active badge on the Services page
- [ ] **Published Posts** count matches the number of posts shown when the Blog "Published" filter is active
- [ ] **Gallery Items** count matches the number of items shown when the Gallery "Active" filter is active

### Settings card

- [ ] If settings have been saved at least once, **Settings** card shows "Configured" in green
- [ ] If settings have never been saved (404 from backend), **Settings** card shows "Not configured" in amber
- [ ] If settings endpoint fails for another reason, **Settings** card shows "—"

### Clickable cards

- [ ] Clicking **Today's Appointments** navigates to `/appointments`
- [ ] Clicking **Pending** navigates to `/appointments`
- [ ] Clicking **Upcoming 7 Days** navigates to `/appointments`
- [ ] Clicking **Unread Messages** navigates to `/messages`
- [ ] Clicking **Active Staff** navigates to `/staff`
- [ ] Clicking **Active Services** navigates to `/services`
- [ ] Clicking **Published Posts** navigates to `/blog`
- [ ] Clicking **Gallery Items** navigates to `/gallery`
- [ ] Clicking **Settings** navigates to `/settings`
- [ ] Card hover shows an indigo border highlight

### Upcoming appointments section

- [ ] "Upcoming Appointments" section heading is visible below the stat cards
- [ ] If there are upcoming appointments, a table shows up to 5 rows with columns: Date, Time, Customer, Service, Status
- [ ] Status column shows the correct colour-coded badge (Pending, Confirmed, etc.)
- [ ] If no upcoming appointments exist, "No upcoming appointments." message is shown
- [ ] "View all" link navigates to `/appointments`

### Partial failure tolerance

- [ ] Stop the backend after the page has loaded — reload the dashboard; all stat cards show "—" except Backend which shows "Offline"
- [ ] Simulate a single endpoint failure (e.g., return an error for `/api/admin/blog`); all other cards still show real data; the failed card shows "—"
- [ ] Page does not throw a JavaScript error or display a blank screen on partial failure

### Build

- [ ] `npm run build` completes with zero TypeScript errors and zero Vite warnings

### Known limitations

- **Today's appointments** count is UTC-based (computed by the backend using `DateTime.UtcNow`). In non-UTC timezones, the count may differ from the local business-day expectation.
- **Dashboard makes 9 parallel requests** instead of one aggregate endpoint. Performance is fine on localhost; a dedicated `GET /api/admin/dashboard/stats` endpoint can be added in a future backend sprint to reduce request count.

---

## v3.2 — Working Hours / Availability Admin

### Navigation

- [ ] Sidebar shows "Working Hours" link between Staff and Services
- [ ] Navigating to `/working-hours` loads the page without error
- [ ] "Working Hours" link has active highlight when on `/working-hours`

### Staff selector

- [ ] Page shows "Select a staff member to manage weekly working hours." when no staff is selected
- [ ] Staff dropdown is populated with all staff members
- [ ] Selecting a staff member loads their schedule

### Weekly schedule table

- [ ] Table always renders exactly 7 rows (Monday through Sunday) once a staff member is selected
- [ ] Days with no backend record show **Not set** badge (amber)
- [ ] Days with `isWorkingDay = false` show **Day off** badge (red)
- [ ] Days with `isWorkingDay = true` show **Working** badge (green), start–end times, and break window if set
- [ ] Every row has an Edit button; there is no Delete button anywhere on the page

### Creating a new working hour record (POST)

- [ ] Click Edit on a day with "Not set" — form opens titled "Configure [Day]" with defaults 09:00–17:00
- [ ] Fill in start and end times, click Save — row updates to show the configured hours
- [ ] Verify the request was a POST (network tab or by checking `createdAt` timestamp is new)

### Updating an existing record (PUT)

- [ ] Click Edit on a day already configured — form opens titled "Edit [Day]" with existing values pre-filled
- [ ] Change end time, click Save — row updates to show new end time
- [ ] Verify the request was a PUT to `/api/admin/staff-working-hours/{id}`

### Setting a day off

- [ ] Click Edit on a working day, uncheck "Working day", click Save
- [ ] Row shows **Day off** badge; working hours and break columns show —
- [ ] Time inputs are disabled/greyed out while "Working day" is unchecked

### Form validation — frontend (no server call should be made)

- [ ] Submit with `isWorkingDay = true` and empty start time → error: "Start time is required for a working day."
- [ ] Submit with start time ≥ end time → error: "Start time must be before end time."
- [ ] Fill break start but leave break end empty → error: "Both break start and break end are required, or leave both empty."
- [ ] Set break start before working start → error: "Break start must be within working hours."
- [ ] Set break end after working end → error: "Break end must be within working hours."

### Backend validation errors

- [ ] With backend running, trigger a backend error (e.g., send an invalid day via API tool) — `extractError` message is shown in the form error banner

### Staff switching

- [ ] Select Staff A, see their schedule; switch to Staff B — schedule reloads cleanly for Staff B
- [ ] Edit form closes automatically when switching staff members

### Error states

- [ ] Stop the backend; select a staff member — "Failed to load working hours." error message is shown
- [ ] Stop the backend; click Save on a configured form — form error banner shows the error; form remains open

### Build

- [ ] `npm run build` completes with zero TypeScript errors and zero Vite warnings

### Known limitations

- **No delete endpoint** — working hour records cannot be removed; setting `isWorkingDay = false` is the only way to mark a day as off
- **No bulk schedule copy** — each staff member's schedule must be configured individually
- **No holiday / time-off exceptions** — only recurring weekly rules are supported
- **No availability slot preview in v3.2** — planned for a future sprint
- **Changing working hours does not automatically cancel existing booked appointments** — admin must review and manage affected appointments manually

---

## v3.3 — Customer Lookup Page

### Navigation

- [ ] Sidebar shows "Customers" link between Appointments and Staff
- [ ] Navigating to `/customers` loads the page without error
- [ ] "Customers" link has active highlight when on `/customers`

### Initial load (no auto-fetch)

- [ ] Page loads without triggering any request to `/api/admin/appointments`
- [ ] No table or results are shown on initial load
- [ ] No create/edit/delete customer buttons exist anywhere on the page

### Validation

- [ ] Click Search with all three fields empty — shows "Enter at least one search field." and makes no API call

### Search by individual fields

- [ ] Enter a customer name, click Search — calls `GET /api/admin/appointments?customerName=...`
- [ ] Enter a customer email, click Search — calls `GET /api/admin/appointments?customerEmail=...`
- [ ] Enter a customer phone, click Search — calls `GET /api/admin/appointments?customerPhone=...`

### Combined filters

- [ ] Fill name + email, click Search — both params sent in a single request
- [ ] Fill all three fields, click Search — all three params sent in a single request

### Results table

- [ ] Matching appointment rows render with columns: Date, Time, Customer, Email, Phone, Service, Staff, Status, Actions
- [ ] Date is formatted as YYYY-MM-DD (no time component)
- [ ] Status badges render with correct class (`status-pending`, `status-confirmed`, `status-cancelled`, `status-completed`)
- [ ] Null email shows `—`; null staff/service shows `—`

### Empty state

- [ ] Search with no matching results — shows "No appointments found for this customer search."

### Actions column

- [ ] Each row has a "View Appointments" link that navigates to `/appointments`
- [ ] No edit/delete/archive button exists in the Actions column

### Clear

- [ ] Click Clear — all three input fields are emptied
- [ ] Click Clear — results table is removed
- [ ] Click Clear — validation/error messages are cleared
- [ ] Click Clear — `hasSearched` resets so empty state is not shown

### Error handling

- [ ] Stop the backend, click Search — error from `extractError` is shown; no crash

### No fake grouping

- [ ] Results are raw appointment records, not grouped by customer email or phone
- [ ] No derived customer IDs or customer profiles are shown

### Build

- [ ] `npm run build` completes with zero TypeScript errors and zero Vite warnings
- [ ] `git status --short` shows exactly: `M SMOKE_TESTS.md`, `M src/App.tsx`, `M src/api/appointmentsApi.ts`, `M src/components/layout/Sidebar.tsx`, `?? src/pages/CustomersPage.tsx`

### Known limitations

- This is Customer Lookup, not a full Customer CRM module
- No Customer entity exists in the backend yet
- Results are appointment records, not customer profiles
- No customer notes, archive, or delete
- No pagination
- Full Customer module requires a backend Customer entity in a later sprint

---

## v3.5 — Customer Management Admin Page

### Navigation

- [ ] Sidebar shows "Customers" link between Appointments and Staff
- [ ] Navigating to `/customers` loads the page without error
- [ ] "Customers" link has active highlight when on `/customers`

### Initial load

- [ ] Customer list fetches automatically on page load (no search button required)
- [ ] Default list shows only active customers (archived hidden by default)
- [ ] Loading state is shown while fetching
- [ ] Table renders with columns: ID, Full Name, Email, Phone, Status, Updated, Actions

### Filters

- [ ] Name filter — typing in Name field re-fetches with `?name=...`
- [ ] Email filter — typing in Email field re-fetches with `?email=...`
- [ ] Phone filter — typing in Phone field re-fetches with `?phone=...`
- [ ] Include archived checkbox — toggling re-fetches with `?includeArchived=true`
- [ ] Multiple filters active simultaneously — all params sent together
- [ ] Clear filters button appears when any filter is active
- [ ] Clear filters resets all fields and refetches unfiltered list

### Create customer

- [ ] "Add Customer" button opens the inline form panel
- [ ] Form is titled "Add Customer"
- [ ] Full Name is required — submitting with blank Full Name shows "Full Name is required." error and makes no API call
- [ ] Submitting with valid Full Name creates a customer and closes form
- [ ] Created customer appears in the list
- [ ] Email, Phone, Notes are optional — can be left blank
- [ ] Blank Email field sends `null` to API, not `""`
- [ ] Blank Phone field sends `null` to API, not `""`
- [ ] Blank Notes field sends `null` to API, not `""`
- [ ] Invalid email format (e.g. `notanemail`) shows backend validation error in form

### Edit customer

- [ ] Edit button opens the form pre-filled with existing customer data
- [ ] Form is titled "Edit Customer"
- [ ] Changing Full Name and saving updates the row
- [ ] Clearing Email field and saving sends `null` — not `""`
- [ ] Clearing Phone field and saving sends `null` — not `""`
- [ ] Clearing Notes field and saving sends `null` — not `""`
- [ ] Cancel button closes form without saving

### Archive / Unarchive

- [ ] Active customer row shows "Archive" button
- [ ] Clicking Archive — customer disappears from default list (includeArchived=false)
- [ ] Enabling Include archived — archived customer reappears with "Archived" status badge (red)
- [ ] Archived customer row shows "Unarchive" button
- [ ] Clicking Unarchive — customer status badge changes to "Active" (green)
- [ ] Archive/unarchive errors are shown above the table with a dismiss button

### Status badges

- [ ] Active customer shows green badge with text "Active" (`status-confirmed`)
- [ ] Archived customer shows red badge with text "Archived" (`status-cancelled`)

### No delete

- [ ] No delete button exists anywhere on the page

### No appointment history

- [ ] No appointment history is shown in v3.5
- [ ] No link to customer appointments exists

### Error states

- [ ] Stop the backend — list shows "Failed to load customers. Check that the backend is running."
- [ ] Stop the backend — archive action shows error above table via `extractError`
- [ ] Stop the backend — form submit shows error inside form panel via `extractError`

### Build

- [ ] `npm run build` completes with zero TypeScript errors and zero Vite warnings

### Known limitations

- No appointment history yet — `Appointment.CustomerId` relationship does not exist
- No pagination
- No duplicate customer detection
- No customer merge
- No hard delete
