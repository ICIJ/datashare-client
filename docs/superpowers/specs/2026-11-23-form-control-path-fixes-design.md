# FormControlPath fixes (short design)

## Intent

Two bugs in the path picker (`src/components/Form/FormControl/FormControlPath.vue`):

1. Projects indexed without a DB row get a fake `sourcePath` from the backend (`/vault/<name>`, `datashare-api/.../Project.java:44`). Browse opens the tree on a folder that does not exist, so the tree is empty.
2. On "Add documents" (local mode), "Browse" often needs two clicks to open the path tree modal.

## Goals

- Bug 1: when Browse opens, resolve the tree root in this order:
  1. The given path, if it exists on disk (`api.tree(path)` does not answer 404).
  2. Otherwise, the deepest folder containing every indexed document of the given projects, if it exists on disk.
  3. Otherwise (nothing indexed, or the indexed folder is missing too), `core.getDefaultDataDir()`.
- Bug 2: Browse opens the modal on the first click, every time.

## Non-goals

- No change to `PathTree` behavior elsewhere in the app (the new `noFold` prop is opt-in).
- No change to projects whose saved path exists.
- No backend change.

## Constraints

- Server mode has no `/tree` disk check: step 1 is skipped there and the given path is kept (today's behavior).
- "Saved path missing" is detected by the `/tree` call answering 404, not by matching `/vault/<name>` (real server projects use that path). Any other error keeps the given path.

## Approaches

- **A, picked:** resolve the root inside `FormControlPath` when Browse opens. Callers pass `projects`. One place, fixes all 3 callers.
- B: resolve in `TaskDocumentsForm` before passing the path. Only fixes Add documents.
- C: fallback inside `PathTree` when `/tree` fails. Changes every tree in the app.

## Decided

- Fallback order above, triggered only when the saved path is missing on disk.
- Logic lives in `FormControlPath`. `TaskDocumentsForm` passes `[form.defaultProject]` as `projects` (memoized), `PathBannerForm` passes its project with `indexed`.
- Indexed folder: one ES query on the project index, `size: 0`, `type: Document`, terms aggregation on `dirname.tree` ordered by count. Keep buckets whose `doc_count` equals the total hits, take the longest key.

## Outcome

- Bug 2: the project menu covered the path picker. It now opens with `placement="right-start"`.
- The root is resolved on every Browse click, never cached, so a folder created or mounted between two opens is found. A spinner shows until it resolves. A lookup that finishes after the path or projects changed is dropped, and the root is resolved again.
- The pill value is never updated on open. On OK without a selection, the resolved root replaces the value only when the value is unset or still equals the `path` prop, and the root is not the data dir. A folder the user picked is never overwritten.
- When the root moves away from the given path, the selection is cleared, so OK cannot save the missing path.
- `api.tree` encodes each folder name (`#` and `?` reached the backend as URL syntax) and splits on both `/` and `\\`.
- The picker shows every folder level (`no-fold`) and skips the `directory_paths` aggregation, which only feeds folding and stats.
- Size of the `dirname.tree` terms aggregation: 100, enough since depth-limited and ordered by count.
