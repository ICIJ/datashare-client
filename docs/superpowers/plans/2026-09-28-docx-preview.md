# Shared Document Toolbox and DOCX Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the document tab header into one component and one composable, migrate the content and PDF tabs onto them, and render `.docx` in the browser with `docx-preview`.

**Architecture:** A new `DocumentToolbox` component owns the sticky header chrome (local search, paginator, global search terms, dropdown slot, hook points), a new `useDocumentLocalSearch` composable owns the find-in-document state machine parameterised by a `findMatches` callback, and a new `DocumentViewerDocx` renders OOXML client-side on top of both. The three existing behaviours (PDF highlights, content offsets/markdown pages, DOCX DOM marks) stay in their own consumers as `findMatches` implementations.

**Tech Stack:** Vue 3 `<script setup>`, Pinia, VueUse, Vitest + Vue Test Utils (jsdom), `docx-preview` 0.4.1, SCSS/Bootstrap 5.

**Spec:** `docs/superpowers/specs/2026-09-28-docx-preview-design.md`

## Global Constraints

- New component path: `src/components/Document/DocumentToolbox/DocumentToolbox.vue`.
- New composable path: `src/composables/useDocumentLocalSearch.js`.
- New viewer path: `src/components/Document/DocumentViewer/DocumentViewerDocx.vue`.
- Dependency: `docx-preview` at `0.4.1` exactly, added to `dependencies` in `package.json`.
- `renderAsync` options are always `{ ignoreLastRenderedPageBreak: false, inWrapper: true }`. The library default for `ignoreLastRenderedPageBreak` is `true`; the page count depends on it being `false`.
- `isDocx` is true only for `application/vnd.openxmlformats-officedocument.wordprocessingml.document`. Legacy `application/msword` stays on the preview server.
- Hook names are preserved verbatim, including the pre-existing oddity `document.content.toolbox.before:before`. The full list, in render order: `document.content.toolbox:before`, `document.content.toolbox.local-search:before`, `document.content.toolbox.local-search:after`, `document.content.toolbox.before:before`, `document.content.toolbox.pagination:after`, `document.content.toolbox:after`.
- Default `compactThreshold` is `770` everywhere.
- Debounce for find-in-document is `300`ms everywhere.
- The `.docx` test fixture must be created for the purpose, never taken from a real corpus.
- No changes to `.doc`, `.pptx`, `text/html`, Entities or Metadata tabs.
- Comments: only where the code cannot say it (a non-obvious *why*). No section labels, no diff narration.
- Run tests with `yarn test <pattern>`; run them in the background and poll rather than blocking.

### Deviations from the spec, decided here

1. **`useDocumentSource` already exists** (`src/composables/useDocumentSource.js`) and does exactly the 404 → `document.errorNotFound`, other → `document.notAvailable` mapping the spec describes writing by hand. `DocumentViewerDocx` reuses it instead of calling `core.api.getSource` directly.
2. **`disabled` prop on `DocumentToolbox`.** The PDF tab today wraps its paginator and dropdown in `<fieldset :disabled="blurred">` (`DocumentViewerPdf.vue:236`), leaving the search field enabled. The spec's prop table has no way to express this, so `DocumentToolbox` takes a `disabled` prop and wraps the paginator plus the `dropdown` slot in that fieldset. Without it, the blurred-content lockout regresses.
3. **Single-page paginator on the PDF tab.** The toolbox hides the paginator below two pages; the PDF tab currently always shows it, so a one-page PDF (and a PDF still loading, where `numPages` is 0) loses its `1 / 1` indicator. This follows the spec's rule and is accepted.

## Review Focus

- **A `.docx` whose fetch 404s.** `useDocumentSource` throws a localized message; the viewer must render the unavailable message rather than an empty page or a raw stack. Covered in Task 7.
- **A `.docx` that renders zero sections** (an empty or unusual OOXML body). `totalPages` must clamp to 1 so the paginator stays valid and `scrollIntoView` is never called on `undefined`. Covered in Task 7.
- **A search term changed while a previous `findMatches` is still in flight.** The older response must not overwrite the newer one's matches; `DocumentContent` guards this today with `lastOccurrencesRetrieval`. Covered in Task 1.
- **A search term cleared to the empty string.** Matches and the active index must clear at once, without waiting out the debounce, and `findMatches` must not be called with an empty term. Covered in Task 1.
- **A `findMatches` that rejects** (the backend 500s, pdf.js throws). The loading flag must clear and the previous matches must not be left on screen as if they still described the new term. Covered in Task 1.

---

### Task 1: `useDocumentLocalSearch`

**Files:**
- Create: `src/composables/useDocumentLocalSearch.js`
- Test: `tests/unit/specs/composables/useDocumentLocalSearch.spec.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  ```js
  useDocumentLocalSearch({ findMatches, debounce = 300 }) => {
    term: Ref<string>,
    debouncedTerm: Ref<string>,
    activeIndex: Ref<number>,   // 1-based, 0 when there is no match
    matches: Ref<Array<{ page: number }>>,
    occurrences: ComputedRef<number>,
    activePage: ComputedRef<number|undefined>,
    isLoading: ComputedRef<boolean>
  }
  ```
  `findMatches` is `(term: string) => Promise<Array<{ page: number }>>`.

- [ ] **Step 1: Write the failing spec**

Create `tests/unit/specs/composables/useDocumentLocalSearch.spec.js`:

```js
import { nextTick, ref } from 'vue'

import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'

describe('useDocumentLocalSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // The debounced term is updated by a timer, and the search it triggers is a
  // promise chain: both have to be drained for the state to settle.
  async function settle(ms = 300) {
    await vi.advanceTimersByTimeAsync(ms)
    await nextTick()
  }

  it('calls findMatches once for a settled term', async () => {
    const findMatches = vi.fn().mockResolvedValue([])
    const { term } = useDocumentLocalSearch({ findMatches })
    term.value = 'f'
    term.value = 'fo'
    term.value = 'foo'
    await settle()
    expect(findMatches).toHaveBeenCalledOnce()
    expect(findMatches).toHaveBeenCalledWith('foo')
  })

  it('does not call findMatches before the debounce elapses', async () => {
    const findMatches = vi.fn().mockResolvedValue([])
    const { term } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle(299)
    expect(findMatches).not.toHaveBeenCalled()
  })

  it('activates the first occurrence of a non-empty result', async () => {
    const findMatches = vi.fn().mockResolvedValue([{ page: 2 }, { page: 5 }])
    const { term, activeIndex, occurrences } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    expect(occurrences.value).toBe(2)
    expect(activeIndex.value).toBe(1)
  })

  it('activates nothing when the result is empty', async () => {
    const findMatches = vi.fn().mockResolvedValue([])
    const { term, activeIndex, occurrences } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    expect(occurrences.value).toBe(0)
    expect(activeIndex.value).toBe(0)
  })

  it('reports the page of the active match', async () => {
    const findMatches = vi.fn().mockResolvedValue([{ page: 2 }, { page: 5 }])
    const { term, activeIndex, activePage } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    expect(activePage.value).toBe(2)
    activeIndex.value = 2
    expect(activePage.value).toBe(5)
  })

  it('clears matches as soon as the term is emptied', async () => {
    const findMatches = vi.fn().mockResolvedValue([{ page: 2 }])
    const { term, activeIndex, occurrences } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    findMatches.mockClear()
    term.value = ''
    await nextTick()
    expect(occurrences.value).toBe(0)
    expect(activeIndex.value).toBe(0)
    await settle()
    expect(findMatches).not.toHaveBeenCalled()
  })

  it('keeps the newest result when an older search resolves last', async () => {
    const deferred = []
    const findMatches = vi.fn(() => new Promise(resolve => deferred.push(resolve)))
    const { term, matches } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    term.value = 'bar'
    await settle()
    expect(deferred).toHaveLength(2)
    deferred[1]([{ page: 9 }])
    await nextTick()
    deferred[0]([{ page: 1 }, { page: 2 }])
    await nextTick()
    expect(matches.value).toEqual([{ page: 9 }])
  })

  it('drops the previous matches when the search rejects', async () => {
    const findMatches = vi.fn().mockResolvedValue([{ page: 2 }])
    const { term, matches, occurrences, isLoading } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    expect(occurrences.value).toBe(1)
    findMatches.mockRejectedValue(new Error('backend is down'))
    term.value = 'bar'
    await settle()
    expect(matches.value).toEqual([])
    expect(isLoading.value).toBe(false)
  })

  it('is loading while the term is settling and while the search runs', async () => {
    let resolveMatches
    const findMatches = vi.fn(() => new Promise((resolve) => { resolveMatches = resolve }))
    const { term, isLoading } = useDocumentLocalSearch({ findMatches })
    expect(isLoading.value).toBe(false)
    term.value = 'foo'
    await nextTick()
    expect(isLoading.value).toBe(true)
    await settle()
    expect(isLoading.value).toBe(true)
    resolveMatches([])
    await nextTick()
    expect(isLoading.value).toBe(false)
  })

  it('accepts a reactive-free findMatches that reads fresh state each call', async () => {
    const source = ref([{ page: 1 }])
    const findMatches = vi.fn(async () => source.value)
    const { term, matches } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    expect(matches.value).toEqual([{ page: 1 }])
    source.value = [{ page: 3 }]
    term.value = 'bar'
    await settle()
    expect(matches.value).toEqual([{ page: 3 }])
  })
})
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `yarn test useDocumentLocalSearch`
Expected: FAIL, "Failed to resolve import @/composables/useDocumentLocalSearch".

- [ ] **Step 3: Write the composable**

Create `src/composables/useDocumentLocalSearch.js`:

```js
import { computed, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

/**
 * The find-in-document state machine shared by every document tab: the term and
 * its debounce, the match list, the active occurrence and the page it sits on.
 *
 * @param {Object} options
 * @param {function(string): Promise<Array<{ page: number }>>} options.findMatches - How this tab finds its matches.
 * @param {number} [options.debounce=300] - Delay before a settled term is searched.
 * @return {Object} The search state.
 */
export function useDocumentLocalSearch({ findMatches, debounce = 300 } = {}) {
  const term = ref('')
  const debouncedTerm = refDebounced(term, debounce)
  const matches = ref([])
  const activeIndex = ref(0)
  const isSearching = ref(false)

  const occurrences = computed(() => matches.value.length)
  const activePage = computed(() => matches.value[activeIndex.value - 1]?.page)
  const isDebouncing = computed(() => debouncedTerm.value !== term.value)
  const isLoading = computed(() => isSearching.value || isDebouncing.value)

  let lastSearch = 0

  function clearMatches() {
    matches.value = []
    activeIndex.value = 0
  }

  async function search(value) {
    const query = value.trim()
    if (!query) {
      clearMatches()
      return
    }
    const id = ++lastSearch
    isSearching.value = true
    try {
      const found = await findMatches(query)
      // A newer term was searched while this one was in flight: its results
      // describe the term on screen, this one's do not.
      if (id !== lastSearch) {
        return
      }
      matches.value = found ?? []
      activeIndex.value = Number(!!matches.value.length)
    }
    catch {
      if (id === lastSearch) {
        clearMatches()
      }
    }
    finally {
      if (id === lastSearch) {
        isSearching.value = false
      }
    }
  }

  // Emptying the field is not a search: the marks have to go at once, and the
  // debounced term would otherwise leave them up for another 300ms.
  watch(term, (value) => {
    if (!value.trim()) {
      lastSearch++
      clearMatches()
    }
  })

  watch(debouncedTerm, search)

  return { term, debouncedTerm, activeIndex, matches, occurrences, activePage, isLoading }
}
```

- [ ] **Step 4: Run the spec to verify it passes**

Run: `yarn test useDocumentLocalSearch`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useDocumentLocalSearch.js tests/unit/specs/composables/useDocumentLocalSearch.spec.js
git commit -m "feat(document): add useDocumentLocalSearch composable"
```

---

### Task 2: `DocumentToolbox`

**Files:**
- Create: `src/components/Document/DocumentToolbox/DocumentToolbox.vue`
- Test: `tests/unit/specs/components/Document/DocumentToolbox/DocumentToolbox.spec.js`

**Interfaces:**
- Consumes: nothing from Task 1 (the composable stays in the consumers).
- Produces: a component with models `search` (string, the default model), `activeIndex` (number), `page` (number); props `occurrences`, `totalPages`, `loading`, `document`, `targetLanguage`, `noCount`, `disabled`, `compactThreshold`, `hookPrefix`; slot `dropdown`; exposed `height` (number).
  Root class is `document-toolbox`. Consumers read the height with `const toolbox = useTemplateRef('toolbox')` then `toolbox.value?.height ?? 0`.

- [ ] **Step 1: Write the failing spec**

Create `tests/unit/specs/components/Document/DocumentToolbox/DocumentToolbox.spec.js`:

```js
import { mount, shallowMount } from '@vue/test-utils'
import { PaginationTiny } from '@icij/murmur'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'
import Hook from '@/components/Hook/Hook'

describe('DocumentToolbox.vue', () => {
  const document = { index: 'foo', id: 'doc-id', routing: 'root-id', source: { metadata: {} }, tags: [] }

  function mountToolbox(props = {}, options = {}) {
    const { plugins } = CoreSetup.init().useAll()
    return shallowMount(DocumentToolbox, {
      props: { document, ...props },
      global: { plugins, renderStubDefaultSlot: true },
      ...options
    })
  }

  it('renders the local search field', () => {
    const wrapper = mountToolbox()
    expect(wrapper.findComponent(DocumentLocalSearch).exists()).toBe(true)
  })

  it('passes the occurrences and the loading flag to the local search field', () => {
    const wrapper = mountToolbox({ occurrences: 3, loading: true })
    expect(wrapper.findComponent(DocumentLocalSearch).props('occurrences')).toBe(3)
    expect(wrapper.findComponent(DocumentLocalSearch).props('loading')).toBe(true)
  })

  it('renders the paginator with the total number of pages', () => {
    const wrapper = mountToolbox({ totalPages: 4 })
    expect(wrapper.findComponent(PaginationTiny).props('totalRows')).toBe(4)
  })

  it('hides the paginator below two pages', () => {
    const wrapper = mountToolbox({ totalPages: 1 })
    expect(wrapper.findComponent(PaginationTiny).exists()).toBe(false)
  })

  it('renders the dropdown slot', () => {
    const slots = { dropdown: '<span class="my-dropdown" />' }
    const wrapper = mountToolbox({}, { slots })
    expect(wrapper.find('.my-dropdown').exists()).toBe(true)
  })

  it('renders no hook when no prefix is given', () => {
    const wrapper = mountToolbox()
    expect(wrapper.findAllComponents(Hook)).toHaveLength(0)
  })

  it('renders every hook position under the given prefix, in order', () => {
    const wrapper = mountToolbox({ hookPrefix: 'document.content', totalPages: 4 })
    const names = wrapper.findAllComponents(Hook).map(hook => hook.props('name'))
    expect(names).toEqual([
      'document.content.toolbox:before',
      'document.content.toolbox.local-search:before',
      'document.content.toolbox.local-search:after',
      'document.content.toolbox.before:before',
      'document.content.toolbox.pagination:after',
      'document.content.toolbox:after'
    ])
  })

  it('keeps the hook positions when the paginator is hidden', () => {
    const wrapper = mountToolbox({ hookPrefix: 'document.content', totalPages: 1 })
    const names = wrapper.findAllComponents(Hook).map(hook => hook.props('name'))
    expect(names).toContain('document.content.toolbox.before:before')
    expect(names).toContain('document.content.toolbox.pagination:after')
  })

  it('updates the search model when a global search term is selected', async () => {
    const wrapper = mountToolbox()
    await wrapper.findComponent({ name: 'DocumentGlobalSearchTerms' }).vm.$emit('select', 'needle')
    expect(wrapper.emitted('update:modelValue')).toEqual([['needle']])
  })

  it('disables the paginator and the dropdown but not the search field', () => {
    const slots = { dropdown: '<span class="my-dropdown" />' }
    const wrapper = mountToolbox({ disabled: true, totalPages: 4 }, { slots })
    const fieldset = wrapper.find('fieldset')
    expect(fieldset.attributes('disabled')).toBeDefined()
    expect(fieldset.findComponent(PaginationTiny).exists()).toBe(true)
    expect(fieldset.find('.my-dropdown').exists()).toBe(true)
    expect(fieldset.findComponent(DocumentLocalSearch).exists()).toBe(false)
  })

  it('exposes the measured height of its root element', () => {
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = mount(DocumentToolbox, {
      props: { document },
      global: { plugins, renderStubDefaultSlot: true }
    })
    expect(typeof wrapper.vm.height).toBe('number')
  })
})
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `yarn test DocumentToolbox`
Expected: FAIL, "Failed to resolve import @/components/Document/DocumentToolbox/DocumentToolbox".

- [ ] **Step 3: Write the component**

Create `src/components/Document/DocumentToolbox/DocumentToolbox.vue`:

```vue
<script setup>
import { computed, toRef, useTemplateRef } from 'vue'
import { useElementBounding } from '@vueuse/core'
import { PaginationTiny } from '@icij/murmur'

import { useCompact } from '@/composables/useCompact'
import DocumentGlobalSearchTerms from '@/components/Document/DocumentGlobalSearchTerms/DocumentGlobalSearchTerms'
import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'
import Hook from '@/components/Hook/Hook'

const search = defineModel({ type: String, default: '' })
const activeIndex = defineModel('activeIndex', { type: Number, default: 0 })
const page = defineModel('page', { type: Number, default: 1 })

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  occurrences: {
    type: Number,
    default: 0
  },
  totalPages: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean
  },
  disabled: {
    type: Boolean
  },
  noCount: {
    type: Boolean
  },
  targetLanguage: {
    type: String,
    default: null
  },
  compactThreshold: {
    type: Number,
    default: 770
  },
  hookPrefix: {
    type: String,
    default: null
  }
})

const element = useTemplateRef('element')
const { height } = useElementBounding(element)
const { compact } = useCompact(element, { threshold: toRef(props, 'compactThreshold') })

const showPagination = computed(() => props.totalPages > 1)

function hookName(position) {
  return props.hookPrefix ? `${props.hookPrefix}.${position}` : null
}

defineExpose({ height })
</script>

<template>
  <div
    ref="element"
    class="document-toolbox d-flex flex-column gap-3"
  >
    <hook
      v-if="hookPrefix"
      :name="hookName('toolbox:before')"
    />
    <div class="d-flex flex-md-nowrap flex-wrap align-items-center gap-3">
      <hook
        v-if="hookPrefix"
        :name="hookName('toolbox.local-search:before')"
      />
      <document-local-search
        v-model="search"
        v-model:active-index="activeIndex"
        :compact="compact"
        :loading="loading"
        :occurrences="occurrences"
        class="flex-grow-1"
      />
      <hook
        v-if="hookPrefix"
        :name="hookName('toolbox.local-search:after')"
      />
      <hook
        v-if="hookPrefix"
        :name="hookName('toolbox.before:before')"
      />
      <fieldset
        :disabled="disabled"
        class="document-toolbox__controls d-flex flex-grow-1 flex-md-grow-0 flex-nowrap align-items-center gap-2"
      >
        <div
          v-if="showPagination"
          class="document-toolbox__controls__pagination"
        >
          <pagination-tiny
            :key="totalPages"
            v-model="page"
            :per-page="1"
            :total-rows="totalPages"
            :compact="compact"
          />
        </div>
        <hook
          v-if="hookPrefix"
          :name="hookName('toolbox.pagination:after')"
        />
        <slot name="dropdown" />
      </fieldset>
    </div>
    <document-global-search-terms
      :document="document"
      :target-language="targetLanguage"
      :no-count="noCount"
      @select="search = $event"
    />
    <hook
      v-if="hookPrefix"
      :name="hookName('toolbox:after')"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-toolbox {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: $spacer 0;
  background: var(--bs-body-bg);
}
</style>
```

- [ ] **Step 4: Run the spec to verify it passes**

Run: `yarn test DocumentToolbox`
Expected: PASS, 12 tests.

- [ ] **Step 5: Lint the new files**

Run: `yarn lint:modified`
Expected: no error.

- [ ] **Step 6: Commit**

```bash
git add src/components/Document/DocumentToolbox tests/unit/specs/components/Document/DocumentToolbox
git commit -m "feat(document): add shared DocumentToolbox component"
```

---

### Task 3: Migrate `DocumentViewerPdf`

**Files:**
- Modify: `src/components/Document/DocumentViewer/DocumentViewerPdf.vue`
- Test: `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf.spec.js` (create)

**Interfaces:**
- Consumes: `DocumentToolbox` (Task 2), `useDocumentLocalSearch` (Task 1).
- Produces: nothing new for later tasks.

- [ ] **Step 1: Write the failing spec**

Create `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf.spec.js`:

```js
import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerPdf from '@/components/Document/DocumentViewer/DocumentViewerPdf'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'

const findHighlights = vi.fn().mockResolvedValue([])

vi.mock('@/composables/usePDF', () => {
  return {
    usePDF: () => ({
      findHighlights,
      load: vi.fn(),
      isLoading: { value: false },
      loaderId: 'pdf',
      pdf: { value: null },
      pdfDoc: { value: null },
      numPages: { value: 3 },
      sizes: { value: [] }
    })
  }
})

describe('DocumentViewerPdf.vue', () => {
  const document = {
    index: 'foo',
    id: 'doc-id',
    routing: 'root-id',
    fullUrl: 'http://localhost/doc.pdf',
    source: { metadata: {} },
    tags: []
  }

  function mountViewer() {
    const { plugins } = CoreSetup.init().useAll()
    return shallowMount(DocumentViewerPdf, {
      props: { document },
      global: { plugins, renderStubDefaultSlot: true }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders its header with the shared toolbox', () => {
    const wrapper = mountViewer()
    expect(wrapper.findComponent(DocumentToolbox).exists()).toBe(true)
  })

  it('gives the toolbox the number of PDF pages', () => {
    const wrapper = mountViewer()
    expect(wrapper.findComponent(DocumentToolbox).props('totalPages')).toBe(3)
  })

  it('registers no hook position', () => {
    const wrapper = mountViewer()
    expect(wrapper.findComponent(DocumentToolbox).props('hookPrefix')).toBe(null)
  })

  it('hides the occurrence count of the global search terms', () => {
    const wrapper = mountViewer()
    expect(wrapper.findComponent(DocumentToolbox).props('noCount')).toBe(true)
  })

  it('puts the PDF dropdown in the toolbox dropdown slot', () => {
    const wrapper = mountViewer()
    expect(wrapper.findComponent({ name: 'DocumentViewerPdfDropdown' }).exists()).toBe(true)
  })

  it('offsets the pages by the height the toolbox reports', async () => {
    const wrapper = mountViewer()
    expect(wrapper.vm.toolboxHeight).toBe(0)
  })
})
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `yarn test DocumentViewerPdf.spec`
Expected: FAIL on the first test, "Component DocumentToolbox not found" (the viewer still renders its own toolbox markup).

- [ ] **Step 3: Replace the toolbox block and the search refs**

In `src/components/Document/DocumentViewer/DocumentViewerPdf.vue`:

Replace the imports of `DocumentLocalSearch` and `DocumentGlobalSearchTerms` with:

```js
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
```

Drop `refDebounced`, `useElementBounding` and `useCompact` from the imports, and drop the `useWait` import if `waitFor`/`isLoading` are no longer used elsewhere in the file.

Replace this block:

```js
const toolboxElement = useTemplateRef('toolbox')
const { height: toolboxHeight } = useElementBounding(toolboxElement)
const { compact: toolboxCompact } = useCompact(toolboxElement, { threshold: toRef(props, 'compactThreshold') })
const highlightText = ref(null)
const highlightTextDebounced = refDebounced(highlightText, 300)
const highlightIndex = ref(0)
const highlightMatches = ref([])
const highlightOccurrences = computed(() => highlightMatches.value.length)
const highlightPage = computed(() => highlightMatches.value[highlightIndex.value - 1]?.page)
const isHighlightDebouncing = computed(() => highlightTextDebounced.value !== highlightText.value)
const isHighlightLoading = computed(() => isLoading.value || isHighlightDebouncing.value)
```

with:

```js
const toolboxElement = useTemplateRef('toolbox')
const toolboxHeight = computed(() => toolboxElement.value?.height ?? 0)
const {
  term: highlightText,
  debouncedTerm: highlightTextDebounced,
  activeIndex: highlightIndex,
  matches: highlightMatches,
  occurrences: highlightOccurrences,
  activePage: highlightPage,
  isLoading: isHighlightLoading
} = useDocumentLocalSearch({ findMatches: term => findHighlights(term) })
```

Delete the `whenever(highlightTextDebounced, waitFor(...))` block: the composable owns it now. Keep the `watch(highlightIndex, ...)` block that holds the page tracking.

Add a writable page model for the toolbox, next to `scrollToPage`:

```js
const page = computed({
  get: () => currentPage.value,
  set: scrollToPage
})
```

In the template, replace the whole `<div ref="toolbox" class="document-viewer-pdf__toolbox …">…</div>` block with:

```vue
<document-toolbox
  ref="toolbox"
  v-model="highlightText"
  v-model:active-index="highlightIndex"
  v-model:page="page"
  :document="document"
  :occurrences="highlightOccurrences"
  :total-pages="numPages"
  :loading="isHighlightLoading"
  :disabled="blurred"
  :compact-threshold="compactThreshold"
  no-count
>
  <template #dropdown>
    <document-viewer-pdf-dropdown
      v-model:rotation="rotation"
      v-model:scale="scale"
      v-model:embed="documentViewStore.embeddedPdf"
      class="flex-shrink-0 ms-auto"
    />
  </template>
</document-toolbox>
```

Delete the now-unused `DocumentViewerPdfPagination` import and its component file usage in this file (the component itself stays on disk, it is also used by `DocumentViewerPdfNavDropdown`; check with `grep -rn "DocumentViewerPdfPagination" src` and delete the component only if this was its last consumer).

Delete the `&__toolbox` rule from the `<style>` block.

- [ ] **Step 4: Run the spec to verify it passes**

Run: `yarn test DocumentViewerPdf`
Expected: PASS, 6 tests in the new spec, and the existing `DocumentViewerPdfDropdown` / `DocumentViewerPdfNavDropdown` specs still pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Document/DocumentViewer/DocumentViewerPdf.vue tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf.spec.js
git commit -m "refactor(document): render the PDF viewer header with DocumentToolbox"
```

---

### Task 4: Regression cover for `DocumentContent`, then migrate it

**Files:**
- Modify: `tests/unit/specs/components/Document/DocumentContent.spec.js`
- Modify: `src/components/Document/DocumentContent.vue`

**Interfaces:**
- Consumes: `DocumentToolbox` (Task 2), `useDocumentLocalSearch` (Task 1).
- Produces: nothing new for later tasks.

- [ ] **Step 1: Add the regression tests the migration could silently break**

The existing spec asserts occurrences, marks and markdown pagination through `wrapper.vm`, but nothing about the hook points or the paginator wiring. Add this block at the end of `tests/unit/specs/components/Document/DocumentContent.spec.js`, inside the top-level `describe`:

```js
describe('the toolbox', () => {
  it('renders every hook position under the document.content prefix', async () => {
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = mount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    const names = wrapper.findAllComponents(Hook).map(hook => hook.props('name'))
    expect(names).toContain('document.content.toolbox:before')
    expect(names).toContain('document.content.toolbox.local-search:before')
    expect(names).toContain('document.content.toolbox.local-search:after')
    expect(names).toContain('document.content.toolbox.before:before')
    expect(names).toContain('document.content.toolbox.pagination:after')
    expect(names).toContain('document.content.toolbox:after')
  })

  it('hides the paginator on a single page document', async () => {
    const { document } = await mockDocumentContentSlice('short')
    const { plugins } = core
    const wrapper = mount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    expect(wrapper.findComponent(PaginationTiny).exists()).toBe(false)
  })

  it('pages the markdown artifact through the toolbox paginator', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md'] })
    api.getStructurePage.mockResolvedValue('# Hello world')
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = mount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    expect(wrapper.findComponent(PaginationTiny).props('totalRows')).toBe(3)
    wrapper.findComponent(PaginationTiny).vm.$emit('update:modelValue', 2)
    await flushPromises()
    expect(wrapper.vm.markdownPage).toBe(2)
  })

  it('pages the plain text slices through the toolbox paginator', async () => {
    const { document } = await mockDocumentContentSlice('a'.repeat(60))
    const { plugins } = core
    const props = { document, pageSize: 10 }
    const wrapper = mount(DocumentContent, { props, global: { plugins } })
    await flushPromises()
    expect(wrapper.findComponent(PaginationTiny).props('totalRows')).toBe(6)
    wrapper.findComponent(PaginationTiny).vm.$emit('update:modelValue', 3)
    await flushPromises()
    expect(wrapper.vm.activeContentSliceOffset).toBe(20)
  })

  it('keeps the dropdown in the toolbox when the document has markdown', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md'] })
    api.getStructurePage.mockResolvedValue('# Hello world')
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = mount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    expect(wrapper.findComponent(DocumentContentDropdown).exists()).toBe(true)
  })
})
```

Add the imports this block needs, at the top of the spec:

```js
import { PaginationTiny } from '@icij/murmur'

import Hook from '@/components/Hook/Hook'
```

- [ ] **Step 2: Run the spec to verify the new tests pass before the migration**

Run: `yarn test DocumentContent.spec`
Expected: PASS. These describe today's behaviour; they must be green *before* the component changes, so a break after it is the migration's doing.

- [ ] **Step 3: Commit the regression cover**

```bash
git add tests/unit/specs/components/Document/DocumentContent.spec.js
git commit -m "test(document): cover the content toolbox before extracting it"
```

- [ ] **Step 4: Drop the throttle and source the search refs from the composable**

In `src/components/Document/DocumentContent.vue`:

Remove `import throttle from 'lodash/throttle'`, `import { PaginationTiny } from '@icij/murmur'`, the `DocumentGlobalSearchTerms` import, the `DocumentLocalSearch` import and the `useCompact` import. Add:

```js
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
```

Replace:

```js
const { compact } = useCompact(elementRef, { threshold: toRef(props, 'compactThreshold') })
```

and:

```js
const localSearchIndex = ref(0)
const localSearchIndexes = ref([])
const localSearchOccurrences = ref(0)
const localSearchTerm = ref(props.q)
```

with:

```js
const {
  term: localSearchTerm,
  activeIndex: localSearchIndex,
  matches: localSearchMatches,
  occurrences: localSearchOccurrences,
  isLoading: isLocalSearchLoading
} = useDocumentLocalSearch({ findMatches })
const localSearchIndexes = computed(() => localSearchMatches.value.map(({ offset }) => offset))

localSearchTerm.value = props.q
```

Add the `findMatches` implementation next to the other retrieval functions, and delete `retrieveOccurrencesAndUpdateContent`, `retrieveTotalOccurrences`, `retrieveTextOccurrences`, `retrieveMarkdownOccurrences` and the `lastOccurrencesRetrieval` counter (the composable owns the ordering guard now):

```js
// One entry per occurrence. Text mode carries the byte offset the marks are
// keyed by and no page: the slice to activate is found from the offset, not
// from a page number, so `activePage` is unused on this tab. Markdown mode
// carries the page and the rank within it.
async function findMatches(term) {
  if (isMarkdownMode.value) {
    return findMarkdownMatches(term)
  }
  return findTextMatches(term)
}

async function findTextMatches(term) {
  try {
    const { offsets = [] } = await api.searchDocument(docIndex.value, docId.value, term, props.targetLanguage, docRouting.value)
    return offsets.map(offset => ({ offset }))
  }
  catch {
    return []
  }
}

async function findMarkdownMatches(term) {
  try {
    const { hits } = await api.searchStructurePages(docIndex.value, docId.value, term, docRouting.value)
    markdownAppliedTerm.value = term
    return flattenPageHits(hits)
  }
  catch {
    markdownAppliedTerm.value = ''
    return []
  }
}
```

`flattenPageHits` stays as it is. `markdownMatches` is replaced by `localSearchMatches` everywhere it is read; delete the `markdownMatches` ref and update `activeMarkdownMatch` to read `localSearchMatches.value[localSearchIndex.value - 1]`.

Replace:

```js
watch(toRef(props, 'q'), value => (localSearchTerm.value = value))

watch(localSearchTerm, throttle(retrieveOccurrencesAndUpdateContent, 300))

watch(localSearchIndex, () => updateContent())
```

with:

```js
watch(toRef(props, 'q'), value => (localSearchTerm.value = value))

watch(localSearchMatches, () => updateContent())

watch(localSearchIndex, () => updateContent())
```

In the `docId` watcher, replace the three `localSearch*` resets and the `lastOccurrencesRetrieval++` line with `localSearchTerm.value = ''` followed by `localSearchTerm.value = props.q`, and drop `markdownMatches.value = []`.

Everywhere `retrieveOccurrencesAndUpdateContent()` was awaited (`loadDocumentContent`, the `isMarkdownMode` watcher), replace it with `await updateContent()` when a term is already set; the composable re-runs the search itself when the term changes, and a mode flip needs the matches for the new mode, so the `isMarkdownMode` watcher instead re-triggers the search by reassigning the term:

```js
watch(isMarkdownMode, async (markdown) => {
  await syncPagePosition(markdown)
  if (isMounted && hasLocalSearchTerms.value) {
    const term = localSearchTerm.value
    localSearchTerm.value = ''
    localSearchTerm.value = term
  }
})
```

- [ ] **Step 5: Replace the toolbox markup**

In the template, replace the whole `<div class="document-content__toolbox …">…</div>` block with:

```vue
<document-toolbox
  v-model="localSearchTerm"
  v-model:active-index="localSearchIndex"
  v-model:page="page"
  :document="document"
  :target-language="targetLanguage"
  :occurrences="localSearchOccurrences"
  :total-pages="nbPages"
  :loading="isLocalSearchLoading"
  :compact-threshold="compactThreshold"
  hook-prefix="document.content"
>
  <template #dropdown>
    <document-content-dropdown
      v-if="hasMarkdown"
      v-model="preferMarkdown"
      :markdown-disabled="isMarkdownEmpty"
      :markdown-slow="markdownOversized"
      :translation="isTranslation"
      class="flex-shrink-0 ms-auto"
    />
  </template>
</document-toolbox>
```

Keep the `showPagination` computed: it still drives the `document-content--paginated` class. Delete the `&__toolbox` rule from the `<style>` block.

- [ ] **Step 6: Run the spec**

Run: `yarn test DocumentContent`
Expected: PASS. Two kinds of failure are expected and get fixed here:
- Tests relying on `vi.mock('lodash/throttle')` to search synchronously now need the debounce to elapse. Remove that mock and drain the debounce with `vi.useFakeTimers()` + `await vi.advanceTimersByTimeAsync(300)` in the tests that set a term, or set `q` as a prop at mount time and `await flushPromises()` twice.
- `wrapper.vm.localSearchIndexes` is now a computed of offsets rather than a ref: assertions like `expect(wrapper.vm.localSearchIndexes).toEqual([5])` still hold.

- [ ] **Step 7: Run the whole document test folder**

Run: `yarn test Document`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/Document/DocumentContent.vue tests/unit/specs/components/Document/DocumentContent.spec.js
git commit -m "refactor(document): render the content toolbox with DocumentToolbox"
```

---

### Task 5: Route `.docx` to a client-side viewer

**Files:**
- Modify: `src/api/resources/Document.js` (beside `isSpreadsheet`)
- Modify: `src/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.vue`
- Test: `tests/unit/specs/api/resources/Document.spec.js`
- Test: `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `Document#isDocx` (boolean getter), and the `'DocumentViewerDocx'` component name resolved by `DocumentViewTabsViewer.previewComponent`.

- [ ] **Step 1: Write the failing tests**

Add to `tests/unit/specs/api/resources/Document.spec.js`, after the JSON block:

```js
describe('check if document is of DOCX type', () => {
  it('should be a DOCX file', () => {
    const contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    const doc = new Document({ _source: { contentType } })
    expect(doc.isDocx).toBeTruthy()
  })

  it('should NOT be a DOCX file for a legacy Word document', () => {
    const doc = new Document({ _source: { contentType: 'application/msword' } })
    expect(doc.isDocx).toBeFalsy()
  })

  it('should NOT be a DOCX file for a presentation', () => {
    const contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    const doc = new Document({ _source: { contentType } })
    expect(doc.isDocx).toBeFalsy()
  })
})
```

Add to `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js`:

```js
it('should call the DocumentViewerDocx component for DOCX document', async () => {
  const contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  const document = await letData(es)
    .have(new IndexedDocument(id, index).withContentType(contentType))
    .commitAndGetLastDocument()
  await documentStore.getDocument({ id, index })

  const wrapper = shallowMount(DocumentViewTabsViewer, {
    global: {
      plugins: core.plugins,
      renderStubDefaultSlot: true
    },
    props: { document, disabled }
  })
  expect(wrapper.vm.previewComponent).toBe('DocumentViewerDocx')
})

it('should keep the DocumentViewerPaginated component for PPTX document', async () => {
  const contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  const document = await letData(es)
    .have(new IndexedDocument(id, index).withContentType(contentType))
    .commitAndGetLastDocument()
  await documentStore.getDocument({ id, index })

  const wrapper = shallowMount(DocumentViewTabsViewer, {
    global: {
      plugins: core.plugins,
      renderStubDefaultSlot: true
    },
    props: { document, disabled }
  })
  expect(wrapper.vm.previewComponent).toBe('DocumentViewerPaginated')
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test Document.spec` then `yarn test DocumentViewTabsViewer`
Expected: FAIL, `doc.isDocx` is `undefined`, and `previewComponent` is `'DocumentViewerPaginated'` for the DOCX case.

- [ ] **Step 3: Add the getter and the route**

In `src/api/resources/Document.js`, right after the `isSpreadsheet` getter:

```js
  get isDocx() {
    return this.contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
```

In `src/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.vue`, remove the wordprocessingml entry from `paginatedTypes`:

```js
const paginatedTypes = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/html'
]
```

and add the case before `isPaginated`:

```js
    case document.value.isDocx:
      return 'DocumentViewerDocx'
    case isPaginated.value:
      return 'DocumentViewerPaginated'
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test Document.spec` then `yarn test DocumentViewTabsViewer`
Expected: PASS. `DocumentViewTabsViewer` will fail to resolve the async component at runtime until Task 6 creates it; `shallowMount` never imports it, so the spec is green.

- [ ] **Step 5: Commit**

```bash
git add src/api/resources/Document.js src/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.vue tests/unit/specs/api/resources/Document.spec.js tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js
git commit -m "feat(document): route docx documents to a client-side viewer"
```

---

### Task 6: `DocumentViewerDocx`

**Files:**
- Modify: `package.json`
- Create: `src/components/Document/DocumentViewer/DocumentViewerDocx.vue`
- Test: `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerDocx.spec.js`

**Interfaces:**
- Consumes: `DocumentToolbox` (Task 2), `useDocumentLocalSearch` (Task 1), `Document#isDocx` (Task 5), `useDocumentSource` (existing), `addSearchMarksClassesInHtml` from `@/utils/strings` (existing).
- Produces: a component taking `document` (Object, required) and `compactThreshold` (Number, default 770), exposing `sections` (Array), `totalPages` (number), `error` (string|null) and `render()` for the tests.

- [ ] **Step 1: Add the dependency**

Run: `yarn add docx-preview@0.4.1`
Expected: `package.json` gains `"docx-preview": "0.4.1"` and `yarn.lock` gains it plus `jszip`.

- [ ] **Step 2: Write the failing spec**

Create `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerDocx.spec.js`:

```js
import { flushPromises, shallowMount } from '@vue/test-utils'
import { renderAsync } from 'docx-preview'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerDocx from '@/components/Document/DocumentViewer/DocumentViewerDocx'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'

vi.mock('docx-preview', () => ({ renderAsync: vi.fn() }))

const getSource = vi.fn()

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()
  return { apiInstance: { ...apiInstance, getSource: (...args) => getSource(...args) } }
})

describe('DocumentViewerDocx.vue', () => {
  const document = { index: 'foo', id: 'doc-id', routing: 'root-id', source: { metadata: {} }, tags: [] }
  const blob = new Blob(['docx'])

  // `renderAsync` writes into the container the component passes it; this is the
  // only thing the component knows about the library's output.
  function renderSections(...contents) {
    renderAsync.mockImplementation(async (source, container) => {
      container.innerHTML = contents.map(html => `<section class="docx">${html}</section>`).join('')
    })
  }

  function mountViewer() {
    const { plugins } = CoreSetup.init().useAll()
    return shallowMount(DocumentViewerDocx, {
      props: { document },
      attachTo: window.document.body,
      global: { plugins, renderStubDefaultSlot: true }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    getSource.mockResolvedValue(blob)
    renderSections('<p>hello world</p>')
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it('fetches the source as a blob', async () => {
    mountViewer()
    await flushPromises()
    expect(getSource).toHaveBeenCalledWith(document, { responseType: 'blob' })
  })

  it('renders the blob into its own container', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    const [source, container] = renderAsync.mock.calls[0]
    expect(source).toBe(blob)
    expect(container).toBe(wrapper.find('.document-viewer-docx__container').element)
  })

  it('asks the library not to ignore the last rendered page breaks', async () => {
    mountViewer()
    await flushPromises()
    const options = renderAsync.mock.calls[0][3]
    expect(options).toEqual({ ignoreLastRenderedPageBreak: false, inWrapper: true })
  })

  it('counts one page per rendered section', async () => {
    renderSections('<p>one</p>', '<p>two</p>', '<p>three</p>')
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('totalPages')).toBe(3)
  })

  it('counts one page when nothing was rendered', async () => {
    renderAsync.mockResolvedValue(undefined)
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('totalPages')).toBe(1)
  })

  it('marks every occurrence of the search term', async () => {
    renderSections('<p>needle and needle</p>', '<p>a needle</p>')
    const wrapper = mountViewer()
    await flushPromises()
    const matches = await wrapper.vm.findMatches('needle')
    expect(matches).toHaveLength(3)
    expect(wrapper.findAll('mark.local-search-term')).toHaveLength(3)
  })

  it('folds accents the way the content tab does', async () => {
    renderSections('<p>Crème brûlée</p>')
    const wrapper = mountViewer()
    await flushPromises()
    const matches = await wrapper.vm.findMatches('creme')
    expect(matches).toHaveLength(1)
  })

  it('reports the section an occurrence belongs to as its page', async () => {
    renderSections('<p>a needle</p>', '<p>another needle</p>')
    const wrapper = mountViewer()
    await flushPromises()
    const matches = await wrapper.vm.findMatches('needle')
    expect(matches.map(({ page }) => page)).toEqual([1, 2])
  })

  it('re-marks from the original html rather than from marked html', async () => {
    renderSections('<p>needle</p>')
    const wrapper = mountViewer()
    await flushPromises()
    await wrapper.vm.findMatches('needle')
    await wrapper.vm.findMatches('need')
    expect(wrapper.findAll('mark.local-search-term')).toHaveLength(1)
    expect(wrapper.find('.document-viewer-docx__container').html()).toContain('>need</mark>le')
  })

  it('shows the page of the active occurrence', async () => {
    renderSections('<p>a needle</p>', '<p>another needle</p>')
    const wrapper = mountViewer()
    await flushPromises()
    wrapper.findComponent(DocumentToolbox).vm.$emit('update:modelValue', 'needle')
    await flushPromises()
    wrapper.findComponent(DocumentToolbox).vm.$emit('update:activeIndex', 2)
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('page')).toBe(2)
  })

  it('shows an error toast and the unavailable message when rendering fails', async () => {
    renderAsync.mockRejectedValue(new Error('corrupt'))
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.find('.document-viewer-docx__error').exists()).toBe(true)
  })

  it('shows the not-found message when the source is gone', async () => {
    getSource.mockRejectedValue({ response: { status: 404 } })
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.find('.document-viewer-docx__error').text()).toBe('Your document was indexed in Datashare but the original is no longer in your Datashare folder on your computer. Preview is thus not available.')
  })
})
```

- [ ] **Step 3: Run the spec to verify it fails**

Run: `yarn test DocumentViewerDocx`
Expected: FAIL, "Failed to resolve import @/components/Document/DocumentViewer/DocumentViewerDocx".

- [ ] **Step 4: Write the component**

Create `src/components/Document/DocumentViewer/DocumentViewerDocx.vue`:

```vue
<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, toRef, useTemplateRef, watch } from 'vue'
import { renderAsync } from 'docx-preview'

import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { useDocumentSource } from '@/composables/useDocumentSource'
import { useToast } from '@/composables/useToast'
import { addSearchMarksClassesInHtml } from '@/utils/strings'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  compactThreshold: {
    type: Number,
    default: 770
  }
})

const ACTIVE_CLASS = 'local-search-term--active'
const BELOW_TOOLBOX_OFFSET = 4

const { fetchSource } = useDocumentSource()
const { toast } = useToast()

const container = useTemplateRef('container')
const toolbox = useTemplateRef('toolbox')
const toolboxHeight = computed(() => toolbox.value?.height ?? 0)

const sections = shallowRef([])
const originalHtml = shallowRef([])
const error = ref(null)
const currentPage = ref(1)
const sectionsBelowToolbox = new Set()

const totalPages = computed(() => Math.max(sections.value.length, 1))

const {
  term,
  activeIndex,
  occurrences,
  activePage,
  isLoading
} = useDocumentLocalSearch({ findMatches })

const page = computed({
  get: () => currentPage.value,
  set: scrollToPage
})

const style = computed(() => ({ '--document-viewer-docx-toolbox-height': `${toolboxHeight.value}px` }))

async function render() {
  error.value = null
  try {
    const blob = await fetchSource(props.document, { responseType: 'blob' })
    await renderAsync(blob, container.value, null, { ignoreLastRenderedPageBreak: false, inWrapper: true })
  }
  catch ({ message }) {
    error.value = message
    toast.error(message)
    return
  }
  sections.value = [...container.value.querySelectorAll('section.docx')]
  originalHtml.value = sections.value.map(({ innerHTML }) => innerHTML)
  currentPage.value = 1
  observeSections()
}

// Marking replaces a section's html, so the marks of the previous term would
// otherwise be marked again by the next one.
function findMatches(value) {
  const marks = [{ term: value }]
  return sections.value.flatMap((section, index) => {
    section.innerHTML = addSearchMarksClassesInHtml(originalHtml.value[index], marks)
    const count = section.querySelectorAll('mark.local-search-term').length
    return Array.from({ length: count }, () => ({ page: index + 1 }))
  })
}

function scrollToPage(value) {
  currentPage.value = value
  sections.value[value - 1]?.scrollIntoView({ block: 'start' })
}

function activateMark() {
  const marks = [...container.value.querySelectorAll('mark.local-search-term')]
  const active = marks[activeIndex.value - 1]
  marks.forEach(mark => mark.classList.toggle(ACTIVE_CLASS, mark === active))
  active?.scrollIntoView({ block: 'center' })
}

let observer = null

// The section under the toolbox is the topmost one still showing once the root
// is shrunk by the toolbox height, the same rule the PDF pages follow.
function observeSections() {
  observer?.disconnect()
  sectionsBelowToolbox.clear()
  const rootMargin = `${-(Math.round(toolboxHeight.value) + BELOW_TOOLBOX_OFFSET)}px 0px 0px 0px`
  observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      const index = sections.value.indexOf(target)
      if (isIntersecting) {
        sectionsBelowToolbox.add(index)
      }
      else {
        sectionsBelowToolbox.delete(index)
      }
    }
    if (sectionsBelowToolbox.size) {
      currentPage.value = Math.min(...sectionsBelowToolbox) + 1
    }
  }, { rootMargin })
  sections.value.forEach(section => observer.observe(section))
}

watch(activeIndex, activateMark)
watch(activePage, (value) => {
  if (value) {
    currentPage.value = value
  }
})
watch(toolboxHeight, () => sections.value.length && observeSections())
watch(toRef(props, 'document'), render, { immediate: true, flush: 'post' })

onBeforeUnmount(() => observer?.disconnect())

defineExpose({ findMatches, render, sections, totalPages, error })
</script>

<template>
  <div
    class="document-viewer-docx"
    :style="style"
  >
    <document-toolbox
      ref="toolbox"
      v-model="term"
      v-model:active-index="activeIndex"
      v-model:page="page"
      :document="document"
      :occurrences="occurrences"
      :total-pages="totalPages"
      :loading="isLoading"
      :compact-threshold="compactThreshold"
    />
    <div
      v-if="error"
      class="document-viewer-docx__error text-center p-3"
    >
      {{ error }}
    </div>
    <div
      v-show="!error"
      ref="container"
      class="document-viewer-docx__container"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-viewer-docx {
  width: 100%;

  &__container:deep(section.docx) {
    scroll-margin-top: var(--document-viewer-docx-toolbox-height, 0px);
  }

  &__container:deep(.local-search-term) {
    background: $mark-bg;
    color: black;
    padding: 0;
  }

  &__container:deep(.local-search-term--active) {
    background: #38d878;
    color: white;
  }
}
</style>
```

- [ ] **Step 5: Run the spec to verify it passes**

Run: `yarn test DocumentViewerDocx`
Expected: PASS, 12 tests. `IntersectionObserver` is polyfilled by the `intersection-observer` dependency loaded in `tests/unit/setup.js`; if it is not defined in this spec's environment, stub it at the top of the spec with `vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} })`.

- [ ] **Step 6: Lint**

Run: `yarn lint:modified`
Expected: no error.

- [ ] **Step 7: Commit**

```bash
git add package.json yarn.lock src/components/Document/DocumentViewer/DocumentViewerDocx.vue tests/unit/specs/components/Document/DocumentViewer/DocumentViewerDocx.spec.js
git commit -m "feat(document): render docx documents in the browser with docx-preview"
```

---

### Task 7: Integration test against the real library

**Files:**
- Create: `tests/unit/resources/document.docx`
- Create: `scripts/build-docx-fixture.mjs`
- Modify: `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerDocx.spec.js`

**Interfaces:**
- Consumes: `DocumentViewerDocx` (Task 6), `jszip` (pulled in transitively by `docx-preview`).
- Produces: the `tests/unit/resources/document.docx` fixture.

- [ ] **Step 1: Write the fixture generator**

Create `scripts/build-docx-fixture.mjs`:

```js
import { writeFileSync } from 'fs'
import JSZip from 'jszip'

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

const paragraph = text => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraph('This is a Datashare test document.')}
    ${paragraph('It holds a needle to find.')}
  </w:body>
</w:document>`

const zip = new JSZip()
zip.file('[Content_Types].xml', contentTypes)
zip.folder('_rels').file('.rels', rels)
zip.folder('word').file('document.xml', documentXml)

const buffer = await zip.generateAsync({ type: 'nodebuffer' })
writeFileSync(new URL('../tests/unit/resources/document.docx', import.meta.url), buffer)
```

- [ ] **Step 2: Generate the fixture**

Run: `node scripts/build-docx-fixture.mjs && ls -l tests/unit/resources/document.docx`
Expected: a file of roughly 1 kB.

- [ ] **Step 3: Write the failing integration test**

Add a second `describe` block at the end of `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerDocx.spec.js`, outside the existing one. It needs the real library, so it lives in its own file-level context:

Create `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerDocxIntegration.spec.js`:

```js
import fs from 'fs'
import { join } from 'path'

import { flushPromises, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerDocx from '@/components/Document/DocumentViewer/DocumentViewerDocx'

const getSource = vi.fn()

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()
  return { apiInstance: { ...apiInstance, getSource: (...args) => getSource(...args) } }
})

describe('DocumentViewerDocx.vue against the real library', () => {
  const document = { index: 'foo', id: 'doc-id', routing: 'root-id', source: { metadata: {} }, tags: [] }

  beforeEach(() => {
    const path = join(__dirname, '../../../../resources/document.docx')
    getSource.mockResolvedValue(new Blob([fs.readFileSync(path)]))
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it('renders the text of a real docx file', async () => {
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerDocx, {
      props: { document },
      attachTo: window.document.body,
      global: { plugins, renderStubDefaultSlot: true }
    })
    await flushPromises()
    expect(wrapper.find('.document-viewer-docx__error').exists()).toBe(false)
    expect(wrapper.find('.document-viewer-docx__container').text()).toContain('This is a Datashare test document.')
  })

  it('finds a term in a real docx file', async () => {
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerDocx, {
      props: { document },
      attachTo: window.document.body,
      global: { plugins, renderStubDefaultSlot: true }
    })
    await flushPromises()
    const matches = await wrapper.vm.findMatches('needle')
    expect(matches).toHaveLength(1)
    expect(wrapper.find('mark.local-search-term').text()).toBe('needle')
  })
})
```

- [ ] **Step 4: Run it**

Run: `yarn test DocumentViewerDocxIntegration`
Expected: PASS, 2 tests.

- [ ] **Step 5: Run the whole suite**

Run `yarn test` in the background and poll; report each check.
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-docx-fixture.mjs tests/unit/resources/document.docx tests/unit/specs/components/Document/DocumentViewer/DocumentViewerDocxIntegration.spec.js
git commit -m "test(document): render a real docx fixture through docx-preview"
```

---

## Suggested follow-ups

- The PDF tab's `pendingPage` / `settleScroll` machinery stays in `DocumentViewerPdf.vue`; if a third tab ever needs lazy-render compensation it is worth extracting then, not now.
- `DocumentViewerPdfPagination.vue` becomes dead if `DocumentViewerPdfNavDropdown` is its only other consumer; check and delete in a separate commit.
