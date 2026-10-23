# CRM Payments and Shipments

## Scope

The deal card now has separate Payments, Shipments and Operations History tabs. The commercial stage, calculated payment status and calculated execution status are independent and are visible in the deal header, table and kanban.

Payments record incoming customer money and outgoing material, delivery or other payments. Plans do not affect actual balances. The UI shows remaining customer/provider balances, overpayments and net cash movement. This is manual operational recording in RUB, not a bank connector, an invoice ledger or statutory accounting.

Shipments support planning, actual confirmation, partial quantities, company-owned loading/unloading addresses, material purchase cost and delivery cost. The UI shows ordered, planned, delivered, remaining and unplanned quantities and progress. Confirming a smaller actual amount replaces that planned record; create a new plan for the unscheduled remainder. Previous values remain in history.

Every mutation uses a server revision. A conflict preserves the entered form data and offers an explicit refresh; the user can review the new totals before resubmitting. Creates use a stable UUID to avoid duplicate records after uncertain responses. Dirty dialogs and route changes prompt before discarding edits. Errors are not presented as empty lists or zero balances.

Cancellation requires a reason and retains the record and before/after audit trail. It is correction of an operational record, not an actual money refund or a separate material return workflow. Cancelled records are read-only and excluded from totals. History includes author, date and paginated changes.

## Compatibility and Calculations

Backend source: `/Users/germankuceravenko/PycharmProjects/grand_nerud`.

New resources are nested below `/deals/{id}`: `operations`, `payments`, `shipments`, and per-entry `/cancel` commands. See `docs/deal-operations.md` in the backend repository for the complete contract.

No new startup migration is needed. Existing delivered quantities are preserved as legacy shipments; reads do not mutate records. The first successful mutation creates an atomic embedded ledger. Confirmed active shipments continue to populate `deliveredQuantity` for the existing calculator. The ordinary edit form links to Shipments and does not resend or overwrite delivered arrays.

Existing margin and manager-commission rules are unchanged. Payments are not treated as profit. A recorded per-shipment delivery cost does not silently replace the existing proportional delivery-cost formula. Customer/provider balances are based on order totals, not invoice maturity or recognized revenue. Mixed historical units produce an explicit warning instead of an invented remainder.

Deploy/restart the updated backend before this frontend. Standard deal PATCH uses `operationsRevision` after ledger creation. Deleting a deal with operational records is blocked to preserve its history. Production data and the running business API were not modified during this task.

## Verification

- Frontend: 153 tests across 18 files; TypeScript and production build pass.
- Backend: 287 tests pass, including real MongoDB integration, ownership, concurrent shipments, request deduplication, exact decimal sums, cancellation, old-volume preservation and standard editing after operations.
- Scoped ESLint passes for changed source files; pre-existing repository-wide lint issues are outside this task.
- Isolated browser fixture: partial payment changes the remaining customer balance; planned shipment confirmation changes progress and remaining quantity; history shows the old and new values. Mobile form verified at 390 x 844 with no horizontal form overflow.
- Existing large-bundle build warning remains. No new frontend dependency was added.

Development UI: `http://127.0.0.1:3000/`. Isolated fake-data fixture: `http://127.0.0.1:3002/tests/visual/workspace.html`. Visual tests never call the production API.
