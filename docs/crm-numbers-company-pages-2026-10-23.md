# CRM: Deal Numbers, Company Pages and Contacts

## Delivered

- Deal numbers are assigned by the backend. Lists, kanban, detail/edit headings and related-deal selectors display the readable number instead of an ObjectId.
- The deals list includes customer, material/service, volume, stage, owner and financial columns. Search, date/number sorting, filters, page and table/kanban mode are URL-driven; changing the view resets the page atomically.
- Named views save search, filters, sort and mode in browser storage, separately by user. They can be applied, updated by name and deleted after confirmation. They do not sync between devices. Invalid or unavailable browser storage does not prevent list use.
- Company selectors load 15 records per request via `GET /companies/page`, search on the server and append pages on scroll. A keyboard-accessible next-page button is also available. Selected companies outside loaded pages are fetched by ID.
- Provider/customer lists request 25 records per page. Geography, material, unit, price ceiling and sorting run on the server, so total counts cover the complete matching directory. The UI does not compare tonne and cubic-metre prices.
- Deal, lead, task and address forms no longer download the entire company directory. Small reference dictionaries are unchanged; missing company labels are resolved only for records currently displayed.
- Company editing exposes every company phone/email and every contact-person phone/email. Rows can be added, changed or removed. Legacy singular `phone`/`email` values and imported `phones`/`emails` arrays are merged without duplicate values; writes keep arrays and the first legacy value for compatibility. Clearing all values sends empty arrays. All emails are validated. FNS `contacts` are not overwritten by manual contact edits.
- Mobile contact fields fit a 390px viewport. The expanded deals toolbar scrolls normally on mobile and stays sticky on desktop.

## Required Backend Update

Backend sources: `/Users/germankuceravenko/PycharmProjects/grand_nerud`.

Deploy/restart the updated backend before serving this frontend. Startup migrations must be enabled. The new `deal_numbers_company_pages_v1` migration backfills numbers for existing and archived deals and creates unique/indexed counters. Take a database backup first. No production migration or backend restart was performed in this task.

The legacy array endpoint `GET /companies` is retained for other clients. New UI code requires `GET /companies/page`; errors are shown explicitly and do not silently trigger a full-directory fallback. The backend API notes are in `docs/company-pages-deal-numbers.md` in the backend repository.

## Verification

- Frontend: 139 tests across 16 files; TypeScript and production build pass.
- ESLint passes for all changed frontend source files. This is a scoped lint check, not a claim that historical repository-wide lint issues are fixed.
- Backend: 259 tests pass, including an opt-in real MongoDB integration test. The integration test uses a random disposable database, real bearer JWTs, HTTP handlers, calculations, aggregation pipelines and unique indexes.
- Real database checks cover full company totals and page separation, legacy numeric INN search, geography/material/unit price filtering, complete contact PATCH without changing FNS data, parallel deal numbering, retry stability, immutable numbers, owner isolation and workspace task totals.
- Browser verification on the isolated fixture: desktop/mobile contact editing, saving a second email, company search/empty state, table/kanban switching, readable numbers, saving/applying/deleting a view. No production business records were edited.
- Build retains the existing large-chunk warning; code splitting was outside this change.

Development UI: `http://127.0.0.1:3000/`. The isolated browser fixture is `http://127.0.0.1:3002/tests/visual/workspace.html` and never sends production API requests.
