# TBT/TTI: Stop Core.js's Store Barrel From Defeating Tree-Shaking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the one confirmed in-repo root cause pushing extra JS into the eagerly-loaded boot chunk (`index-*.js`), which drives Total Blocking Time and Time to Interactive.

**Architecture:** `src/core/Core.js` does `import * as stores from '@/store/modules'` and exposes it via a `get stores()` getter. A namespace (`import *`) import is a live binding to every export of the barrel — Rollup cannot tree-shake individual members out of an object that escapes the module (it's returned by the getter), so all 15 Pinia store modules (`search.js` at 1171 lines down to `player.js` at 13 lines, ~148 KB source total) get pulled into whatever chunk contains `Core.js`, even though only one store (`useSearchStore`) is actually used inside `Core.js` itself, and nothing else in the codebase or docs consumes the `stores` getter. Fix: import `useSearchStore` directly (named import, tree-shakeable), and delete the dead `stores` getter and its eager barrel import.

**Tech Stack:** Vue 3, Pinia, Vite/Rollup, Vitest.

**Spec:** No separate spec doc — root cause and scope were established via Lighthouse report comparison (`localhost_9009-20260727T161916.json` vs `localhost_9009-20260812T180134.json`) and codebase investigation in this conversation. Key numbers: TBT 2100ms → 520ms, TTI 23.0s → 4.7s across those two reports; this plan targets the boot-chunk scripting time (857ms of the 1006ms `index-*.js` bootup-time) still remaining after that work.

## Global Constraints

- Out of scope: `vendor-charts` (90% unused) and `vendor-ui` unused JS are caused by `@icij/murmur`'s barrel statically importing `d3-geo`/`d3-scale`/lodash — that's an upstream murmur fix, not something to patch in this repo (see `vite.config.js:160-161` comment and prior investigation). Do not attempt a local workaround (e.g. vite.config aliasing) for that.
- No new dependencies. No new abstractions (no "store registry" module, no lazy-loading framework) — this is a two-line import fix plus deleting dead code.
- Run `yarn lint --fix` before committing.
- Do not commit `todo.md`/`log.md`/`summarize.md` scratch files.
- Follow existing test conventions in `tests/unit/specs/core/Core.spec.js` (Vitest, existing `describe('Core', ...)` structure, no new test framework).

---

### Task 1: Stop `Core.js` from eagerly importing every store module

**Files:**
- Modify: `src/core/Core.js:33` (import), `src/core/Core.js:267` (usage), `src/core/Core.js:544-549` (getter)
- Test: `tests/unit/specs/core/Core.spec.js`

**Interfaces:**
- Consumes: `useSearchStore` exported from `src/store/modules/search.js` (already the barrel's first re-export, `src/store/modules/index.js:1`, chosen specifically to avoid circular-dependency issues — import it from that same path, not a new one).
- Produces: `Core` instance no longer exposes a `stores` getter. Confirmed via grep in this conversation that no source file, test, or doc reads `datashare.stores` / `this.stores` anywhere in the repo — removing it has no other call site to update.

- [ ] **Step 1: Write the failing test for direct store usage**

Add to `tests/unit/specs/core/Core.spec.js` inside the existing `describe('Call useAll on Core', () => { ... })` block (reuse the `core`/`api` setup already in that file — don't duplicate it):

```javascript
  it('should not expose a `stores` getter', () => {
    expect(core.stores).toBeUndefined()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/core/Core.spec.js`
Expected: FAIL — `core.stores` currently returns the store namespace object, not `undefined`.

- [ ] **Step 3: Fix the import and delete the dead getter**

In `src/core/Core.js`, replace the namespace import:

```javascript
import * as stores from '@/store/modules'
```

with a direct, tree-shakeable import from the concrete module (not the barrel — the barrel is fine for other named imports elsewhere in the codebase, but importing straight from `search.js` here removes any dependency on how the barrel is structured):

```javascript
import { useSearchStore } from '@/store/modules/search'
```

Replace the boot-time usage at line 267:

```javascript
      const searchStore = this.stores.useSearchStore()
```

with:

```javascript
      const searchStore = useSearchStore()
```

Delete the getter (previously at lines 544-549):

```javascript
  /**
   * All Pinia stores available in the application
   */
  get stores() {
    return stores
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/core/Core.spec.js`
Expected: PASS, including the pre-existing `'should set policies in config from getUserPermissions after loadUser'` test (line 115 area) which exercises the same boot path that calls `useSearchStore()` — confirm it still passes unchanged, since that's the regression check that the store still initializes correctly.

- [ ] **Step 5: Run lint**

Run: `yarn lint --fix`
Expected: clean, no unused-import warnings (the old `stores` import must be fully gone, not just unused).

- [ ] **Step 6: Commit**

```bash
git add src/core/Core.js tests/unit/specs/core/Core.spec.js
git commit -m "perf(core): stop Core.js's namespace import from pulling every store into the boot chunk"
```

---

### Task 2: Confirm the store modules dropped out of the eager chunk

This is a build-output check, not a unit test — tree-shaking happens at bundle time, so Task 1's unit test can't see it. Do this manually; no new automated test (a chunk-membership assertion would need to parse built output and is disproportionate to a two-line fix — if this regresses again, `du -h dist/assets/index-*.js` catching a size jump is enough of a tripwire, matching the "boring over clever" call).

- [ ] **Step 1: Build with the bundle visualizer**

Run: `VITE_ANALYZE=true yarn build`

- [ ] **Step 2: Check `dist/stats.html` for store modules**

Open `dist/stats.html` (or grep the raw chunk if easier: `grep -o "store/modules/[a-zA-Z]*\.js" dist/assets/index-*.js | sort -u`) and confirm only `search.js` (and its own imports) shows up in `index-*.js` — `document.js`, `app.js`, `task.js`, `pipelines.js`, `starred.js`, etc. should no longer appear in that chunk (they should only appear in the route chunks that actually import them, e.g. `useDocumentStore` inside the document-view chunk).

- [ ] **Step 3: Compare `index-*.js` size before/after**

Run: `ls -la dist/assets/index-*.js`

Expected: smaller than the pre-fix build (148 KB of store source no longer forced into this chunk, though actual gzip delta will be less since lodash/JSON-heavy store code doesn't compress 1:1 with source size — record whatever the real number is, don't guess it in advance).

- [ ] **Step 4: Note the result**

No commit needed for this task (no file changes) — record the before/after `index-*.js` size in the PR description when this plan's branch is opened, so the reviewer sees the measured effect, not just the diff.

---

### Task 3: Re-run Lighthouse to confirm TBT/TTI moved

- [ ] **Step 1: Start the app**

Run: `yarn dev` (or the project's normal local-serve command — confirm against `package.json` `scripts` if `dev` isn't it) and let it settle on `http://localhost:9009/`.

- [ ] **Step 2: Run Lighthouse against the same URL as the two prior reports**

Use the same method that produced `localhost_9009-20260727T161916.json` / `localhost_9009-20260812T180134.json` (Chrome DevTools Lighthouse panel, default/no-throttling-changed settings) against `http://localhost:9009/`.

- [ ] **Step 3: Compare `bootup-time` and `mainthread-work-breakdown` for `index-*.js`**

Expected: `index-*.js` scripting time drops from the 857ms recorded in the Aug 12 report by roughly the store-code share removed. TBT/TTI overall will likely move less dramatically than that one number, since `vendor-ui`/`vendor-charts` (out of scope, upstream murmur) still dominate — don't expect this alone to turn the performance score green.

- [ ] **Step 4: Record the new numbers**

Save the new report JSON alongside the existing two (same naming convention: `localhost_9009-<timestamp>.json`) so the three-report trend stays comparable. Do not commit it unless the user asks — these report files aren't currently tracked in git status, keep that as-is.

---

## Self-Review

- **Spec coverage:** Only one confirmed, fixable-in-this-repo root cause was found (Core.js's eager store barrel). The other two contributors identified earlier in this conversation (`vendor-ui`/`vendor-charts` unused JS from murmur's barrel) are explicitly out of scope per Global Constraints — there is no task for them because there is no in-repo fix; the ceiling is documented instead of faked with a workaround.
- **Placeholder scan:** No TBD/TODO markers; every step has literal code or literal commands.
- **Type consistency:** `useSearchStore` is used identically in Task 1's Step 3 and Step 4 (no renamed variants); Task 2/3 don't introduce new interfaces.
