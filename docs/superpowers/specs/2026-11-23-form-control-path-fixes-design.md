# FormControlPath fixes (short design)

## Intent

Two bugs in the path picker (`src/components/Form/FormControl/FormControlPath.vue`):

1. Projects indexed without a DB row get a fake `sourcePath` from the backend (`/vault/<name>`, `datashare-api/.../Project.java:44`). Browse opens the tree on a folder that does not exist, so the tree is empty.
2. On "Add documents" (local mode), "Browse" often needs two clicks to open the path tree modal.

## Goals

- Bug 1: when Browse opens, resolve the tree root in this order:
  1. The given path, if it exists on disk (`api.tree(path)` succeeds).
  2. Otherwise, the deepest folder containing every indexed document of the given projects.
  3. Otherwise (nothing indexed), `core.getDefaultDataDir()`.
- Bug 2: Browse opens the modal on the first click, every time.

## Non-goals

- No change to `PathTree` behavior elsewhere in the app.
- No change to projects whose saved path exists.
- No backend change.

## Constraints

- Server mode has no `/tree` disk check: step 1 is skipped there and the given path is kept (today's behavior).
- "Saved path missing" is detected by the `/tree` call failing, not by matching `/vault/<name>` (real server projects use that path).

## Approaches

- **A, picked:** resolve the root inside `FormControlPath` when Browse opens. Callers pass `projects`. One place, fixes all 3 callers.
- B: resolve in `TaskDocumentsForm` before passing the path. Only fixes Add documents.
- C: fallback inside `PathTree` when `/tree` fails. Changes every tree in the app.

## Decided

- Fallback order above, triggered only when the saved path is missing on disk.
- Logic lives in `FormControlPath`; `TaskDocumentsForm` passes `[form.defaultProject]` as `projects`.
- Indexed folder: one ES query on the project index, `size: 0`, `type: Document`, terms aggregation on `dirname.tree` ordered by count. Keep buckets whose `doc_count` equals the total hits, take the longest key.

## Left to the builder

- Bug 2 root cause: reproduce in the browser first (local mode, Add documents page), then fix. Suspect: `lazy` on `AppModal` with bootstrap-vue-next 1.0.1.
- Whether the resolved root also updates the displayed pill value (my call: yes, when `modelValue` is unset or still equals the `path` prop, so the Add documents form submits the resolved folder instead of `/vault/<name>`, and a folder the user picked is never overwritten).
- Size of the `dirname.tree` terms aggregation (my call: 100, enough since depth-limited and ordered by count).
