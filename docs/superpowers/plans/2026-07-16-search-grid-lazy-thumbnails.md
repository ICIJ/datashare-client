# Search Grid Lazy Thumbnails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make document preview thumbnails in the search GRID layout lazy-load on scroll instead of all fetching on mount.

**Architecture:** `DocumentThumbnail` already implements visibility-based lazy loading behind its `lazy` boolean prop (IntersectionObserver via VueUse `useElementVisibility` + `whenever(..., { once: true })`). The list layout (`DocumentCard.vue`) and table layout (`DocumentRowThumbnail.vue`) pass `lazy`; the grid layout (`DocumentCardGrid.vue`) does not. The fix is to pass the prop, guarded by a unit test.

**Tech Stack:** Vue 3 (`<script setup>`), Vitest, @vue/test-utils, project test harness `~tests/unit/CoreSetup`.

## Global Constraints

- Commits: conventional-commit subject line only, no body, never co-authored (user rule).
- Spec: `docs/superpowers/specs/2026-07-16-search-grid-lazy-thumbnails-design.md` (untracked — `docs/superpowers` is gitignored; do not force-add it).

---

### Task 1: Pass `lazy` to the grid thumbnail

**Files:**
- Modify: `src/components/Document/DocumentCard/DocumentCardGrid.vue:73-82` (the `<document-thumbnail>` element)
- Test (create): `tests/unit/specs/components/Document/DocumentCard/DocumentCardGrid.spec.js`

**Interfaces:**
- Consumes: `DocumentThumbnail`'s existing `lazy: { type: Boolean, default: false }` prop (`src/components/Document/DocumentThumbnail/DocumentThumbnail.vue:45-48`).
- Produces: nothing consumed by other tasks (single-task plan).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/components/Document/DocumentCard/DocumentCardGrid.spec.js` (the `DocumentCard/` directory under the unit specs does not exist yet — creating the file creates it):

```js
import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentCardGrid from '@/components/Document/DocumentCard/DocumentCardGrid'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'

vi.mock('@/composables/useDocument', () => ({
  useDocumentModal: () => ({ show: vi.fn() })
}))

describe('DocumentCardGrid.vue', () => {
  it('renders the thumbnail with lazy loading enabled', () => {
    const core = CoreSetup.init().useAll()
    const document = { id: 'doc-1', index: 'local-datashare', routing: 'doc-1', title: 'A document' }

    const wrapper = shallowMount(DocumentCardGrid, {
      global: { plugins: core.plugins },
      props: { document }
    })

    expect(wrapper.findComponent(DocumentThumbnail).props('lazy')).toBe(true)
  })
})
```

Notes for the implementer:
- `shallowMount` stubs all child components, so `RouterLinkDocument`, `DocumentActionsGroup`, etc. don't need a router or stores; `findComponent(DocumentThumbnail)` still resolves the stub and `props()` returns the resolved props.
- `useDocumentModal` is mocked because it runs in the component's setup.
- The thumbnail renders because the default `properties` prop includes `'thumbnail'`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn vitest --run tests/unit/specs/components/Document/DocumentCard/DocumentCardGrid.spec.js`

Expected: FAIL — `expected false to be true` (the `lazy` prop currently falls back to its default `false`).

If it instead fails at mount with an error, fix the test setup first — the assertion failure above is the only acceptable "red".

- [ ] **Step 3: Add the `lazy` attribute**

In `src/components/Document/DocumentCard/DocumentCardGrid.vue`, change the `<document-thumbnail>` element:

```html
      <document-thumbnail
        v-if="showThumbnail"
        :document="document"
        size="md"
        crop
        lazy
        clickable
        :active="hover"
        class="mx-auto above-stretched-link"
        @click="showDocumentViewerModal"
      />
```

(The only change is the added `lazy` line, placed after `crop` to mirror the attribute order in `DocumentCard.vue:90-97`.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn vitest --run tests/unit/specs/components/Document/DocumentCard/DocumentCardGrid.spec.js`

Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/Document/DocumentCard/DocumentCardGrid.vue tests/unit/specs/components/Document/DocumentCard/DocumentCardGrid.spec.js
git commit -m "fix(search): lazy load preview thumbnails in grid layout"
```

- [ ] **Step 6: Manual verification (from the spec)**

Run the dev server (`yarn dev`), open search results, switch to grid layout, open the browser network tab, and confirm preview requests fire progressively while scrolling instead of all at once on page load.
