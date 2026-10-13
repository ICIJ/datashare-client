# Disable Batch Download Button With No Results — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Disable the batch download button in the search toolbar when the result set is empty, so users cannot queue a batch download that would produce an empty archive.

**Architecture:** A single template change in `DocumentEntriesHeader.vue` adds `:disabled="total === 0"` to `<button-download-documents>`. The `total` prop is already declared on that component and already drives the sibling `<button-toggle-batch-mode>` the same way. `disabled` reaches the native `<button>` through Vue attribute fallthrough: `ButtonDownloadDocuments` → murmur `ButtonIcon` → `BButton` → `<button disabled>`.

**Tech Stack:** Vue 3 (`<script setup>`), murmur `ButtonIcon`, bootstrap-vue-next `BButton`, Vitest + `@vue/test-utils`.

Spec: `docs/superpowers/specs/2026-08-10-disable-batch-download-no-results-design.md`
Issue: [ICIJ/datashare#2283](https://github.com/ICIJ/datashare/issues/2283)

## Global Constraints

- Do not modify `src/components/Button/ButtonDownloadDocuments.vue`. `disabled` is delivered by attribute fallthrough, not by a declared prop. (See "Contingency" in Task 1 for the only case where this changes.)
- Do not add an i18n key. The disabled button intentionally shows no tooltip, because Bootstrap's `.btn:disabled` sets `pointer-events: none`.
- Do not change the empty-state copy ("No documents matched your search") or the batch download estimation flow.
- Commit with the `/commit` skill, which runs lint and tests.
- Commit message format follows the repo convention of `<type>(<scope>): <subject> icij/datashare#<issue>`.

---

### Task 1: Disable the batch download button when `total === 0`

**Files:**
- Modify: `src/components/Document/DocumentEntries/DocumentEntriesHeader.vue:146-150`
- Test: `tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js`

**Interfaces:**
- Consumes: the existing `total` prop on `DocumentEntriesHeader` (`Number`, default `0`, declared at lines 26-29). Nothing new is introduced.
- Produces: nothing consumed by other tasks. This is the only task.

**Background the implementer needs:**

The test file already mocks `useBatchDownloadEstimation`, `useBatchDownloadConfirmModal` and `useToast`, and its `factory()` hardcodes `props: { total: 10 }`. You must parameterize `factory()` so a test can pass `total: 0`. All six existing tests call `factory()` with no arguments, so keeping `total: 10` as the default preserves their behavior exactly.

`button-download-documents` is **not** stubbed in this test file (only `button-toggle-batch-mode` and `row-pagination-documents` are), so it renders all the way down to a real `<button>` element. That is what makes the `attributes('disabled')` assertion meaningful.

The assertion style is copied from the existing precedent at
`tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsActions.spec.js:40-54`, which tests `ButtonRowAction` — a component that, like `ButtonDownloadDocuments`, wraps murmur's `ButtonIcon` without declaring a `disabled` prop.

---

- [ ] **Step 1: Parameterize the test factory**

In `tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js`, replace the existing `factory` function (lines 74-85):

```js
  function factory(props = {}) {
    return mount(DocumentEntriesHeader, {
      global: {
        plugins,
        stubs: {
          'button-toggle-batch-mode': true,
          'row-pagination-documents': true
        }
      },
      props: { total: 10, ...props }
    })
  }
```

Do not touch any of the six existing `it(...)` blocks.

- [ ] **Step 2: Write the failing tests**

Add this nested `describe` block inside the existing
`describe('DocumentEntriesHeader.vue — runBatchDownload orchestration', ...)`,
immediately after the last `it(...)` block (after line 170) and before the
closing `})` of the outer describe:

```js
  describe('disabled state', () => {
    it('disables the batch download button when there are no results', () => {
      const wrapper = factory({ total: 0 })
      const button = wrapper.findComponent({ name: 'ButtonDownloadDocuments' })
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('enables the batch download button when there are results', () => {
      const wrapper = factory({ total: 10 })
      const button = wrapper.findComponent({ name: 'ButtonDownloadDocuments' })
      expect(button.attributes('disabled')).toBeUndefined()
    })
  })
```

Both tests matter. The second one is what proves the first is not passing vacuously — without it, a component that is *always* disabled would look correct.

- [ ] **Step 3: Run the tests to verify the first one fails**

Run:

```bash
yarn test:unit tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js
```

Expected: `disables the batch download button when there are no results` **FAILS** with something like `expected undefined to be defined`, because the button is currently never disabled.

Expected: `enables the batch download button when there are results` **PASSES** already, and the six pre-existing tests still pass.

Do not proceed until you have seen that exact red/green split. If the first test passes at this point, the test is not testing anything — stop and diagnose.

- [ ] **Step 4: Write the minimal implementation**

In `src/components/Document/DocumentEntries/DocumentEntriesHeader.vue`, add one line to the `<button-download-documents>` element (currently lines 146-150):

```vue
        <button-download-documents
          :label="batchDownloadDocumentsLabel"
          :loading="batchDownloadLoading"
          :disabled="total === 0"
          @click="runBatchDownload"
        />
```

That is the entire production change. No script changes, no new imports, no new computed.

- [ ] **Step 5: Run the tests to verify they pass**

Run:

```bash
yarn test:unit tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js
```

Expected: all eight tests PASS (six pre-existing + two new).

**Contingency:** if the first new test still fails because `disabled` never reaches the DOM, the fallthrough chain is broken somewhere. In that case only, add `disabled` as an explicit prop in `src/components/Button/ButtonDownloadDocuments.vue` — add to `defineProps`:

```js
  disabled: {
    type: Boolean,
    default: false
  }
```

and bind `:disabled="disabled"` on `<button-icon>`. Report that you had to do this, since it contradicts the spec's expectation.

- [ ] **Step 6: Run the full test suite and lint**

Run:

```bash
yarn test:unit
yarn lint:modified
```

Expected: no new failures and no new lint errors. Distinguish any pre-existing failures or Sass deprecation warnings from problems this change introduced, and say which is which.

- [ ] **Step 7: Commit**

Use the `/commit` skill. Message:

```
feat(search): disable batch download button when there are no results icij/datashare#2283
```

Stage only these two files:

- `src/components/Document/DocumentEntries/DocumentEntriesHeader.vue`
- `tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js`

---

## Manual verification (optional)

Run the dev server, search for a string that matches nothing, and confirm the download icon next to `0 of 0 documents` is dimmed, unclickable, and shows no tooltip on hover. Then search for something with results and confirm the button is active again and its tooltip returns.

## Self-review notes

- **Spec coverage:** the spec's single design decision (`:disabled="total === 0"`, no tooltip, no new i18n key) is Task 1 Step 4. Its testing section (a `total: 0` case plus a `total: 10` case that can go red) is Steps 1-3. Its "behavior changes" section needs no code, being consequences of the same line.
- **Type consistency:** `total` is the same `Number` prop throughout; no new symbols are introduced anywhere in the plan.
- **No placeholders:** every code step contains the literal code to write.
