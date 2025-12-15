# Plan Review (GPT)

LGTM.

## Minor Nits / Clarifications
- **Date-only formatting**: In the `calculateNextDue()` snippet, `formatISO(...)` will default to a datetime; use `formatISO(date, { representation: 'date' })` or `format(date, 'yyyy-MM-dd')` to keep storage truly `YYYY-MM-DD`.
- **Import semantics**: If a user supplies both `firstDueDate` and `lastCompleted`, confirm the rule for initial `nextDue` (likely `lastCompleted + interval`, with `firstDueDate` only used when never completed).
- **Undo + “most recent”**: Define “most recent drives `nextDue`” as max by `completedAt` (not `recordedAt`), and specify undo behavior (remove record + recompute from the prior max, else revert to `firstDueDate`).
- **Categories**: PRD says categories can be deleted; Design marks `isDefault` and says defaults can’t be deleted. Confirm that’s intended, and whether “Uncategorized” is a real category record or simply `categoryId` unset.
- **Corrupt storage**: Consider a note to handle invalid JSON in localStorage (reset to defaults, optionally with a backup) to avoid bricking the app.
