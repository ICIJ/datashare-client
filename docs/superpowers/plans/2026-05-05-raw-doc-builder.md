# RawDocBuilder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a lightweight fluent document builder (`RawDocBuilder`) that produces the `{ _id, _index, _source }` ES raw hit shape needed by `documentStore.setDocument()`, then migrate the four slowest document test files off real Elasticsearch.

**Architecture:** A single class in `tests/unit/RawDocBuilder.js` with no heavy imports mirrors the `IndexedDocument` fluent API but terminates with `.toRaw()` instead of `.commit()`. Four spec files currently doing real ES round-trips replace those calls with `documentStore.setDocument(RawDocBuilder.build(...).toRaw())`.

**Tech Stack:** Vitest, Vue Test Utils, Pinia (`useDocumentStore`), lodash `uniqueId`, Node `path`

---

## File Map

| File | Action |
|------|--------|
| `tests/unit/RawDocBuilder.js` | **Create** — the fluent builder class |
| `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata.spec.js` | **Modify** — replace inline `makeRawDoc()` with `RawDocBuilder` |
| `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js` | **Modify** — drop ES, use `RawDocBuilder` + `documentStore.setDocument()` |
| `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities.spec.js` | **Modify** — drop ES, use `RawDocBuilder` + mock NER API |
| `tests/unit/specs/components/Document/DocumentContent.spec.js` | **Modify** — drop ES in `mockDocumentContentSlice`, use `RawDocBuilder` |

---

## Task 1: Create `RawDocBuilder`

**Files:**
- Create: `tests/unit/RawDocBuilder.js`

- [ ] **Step 1: Write `tests/unit/RawDocBuilder.js`**

```js
import { find, uniqueId } from 'lodash'
import { win32 } from 'path'

export default class RawDocBuilder {
  constructor(path = uniqueId('/path/to/document/'), index = 'default-index') {
    this._id = path
    this._index = index
    this._source = {
      type: 'Document',
      path,
      dirname: win32.dirname(path),
      join: { name: 'Document' },
      language: 'ENGLISH',
      title: path,
      titleNorm: path.normalize('NFD').toLowerCase(),
      extractionLevel: 0,
      nerTags: [],
      metadata: {
        tika_metadata_resourcename: path,
        tika_metadata_another_metadata: null,
        tika_metadata_content_type: null,
        tika_metadata_dcterms_created: null,
        tika_metadata_dc_creator: null
      }
    }
  }

  withContent(content) {
    this._source.content = content
    this._source.contentTextLength = content.length
    return this
  }

  withContentLength(contentLength) {
    this._source.contentLength = contentLength
    return this
  }

  withContentType(contentType) {
    this._source.metadata.tika_metadata_content_type = contentType
    this._source.contentType = contentType.split(';')[0].trim()
    if (contentType.indexOf('charset') > 0) {
      this._source.contentEncoding = contentType.split('=')[1].trim()
    }
    return this
  }

  withIndexingDate(indexingDate) {
    this._source.extractionDate = indexingDate
    return this
  }

  withResourceName(resourceName) {
    this._source.metadata.tika_metadata_resourcename = resourceName
    return this
  }

  withAuthor(author) {
    this._source.metadata.tika_metadata_dc_creator = author
    return this
  }

  withCreationDate(creationDate) {
    this._source.metadata.tika_metadata_dcterms_created = creationDate
    return this
  }

  withOtherMetadata(otherMetadata) {
    this._source.metadata.tika_metadata_another_metadata = otherMetadata
    return this
  }

  withMetadata(metadata) {
    const md = (metadata !== null && typeof metadata === 'object') ? metadata : {}
    this._source.metadata = { ...md, ...this._source.metadata }
    return this
  }

  withLanguage(language) {
    this._source.language = language
    return this
  }

  withNoContentTranslated() {
    this._source.content_translated = []
    return this
  }

  withContentTranslated(content, sourceLanguage, targetLanguage) {
    const translation = { content, source_language: sourceLanguage, target_language: targetLanguage }
    this._source.content_translated ||= []
    this._source.content_translated.push(translation)
    return this
  }

  // NER detail lives in separate ES child documents, not in the document _source.
  // This method is a no-op for the raw shape; withPipeline() sets the nerTags field.
  withNer(_mention, _offset, _category, _isHidden) {
    return this
  }

  withParent(parentId) {
    this._source.parentDocument = parentId
    this._source.extractionLevel = 1
    return this
  }

  withRoot(rootId) {
    this._source.rootDocument = rootId
    return this
  }

  withPipeline(pipeline) {
    this._source.nerTags.push(pipeline)
    return this
  }

  withTags(tags) {
    this._source.tags = tags
    return this
  }

  toRaw() {
    return { _id: this._id, _index: this._index, _source: { ...this._source } }
  }

  static build(path, index) {
    return new RawDocBuilder(path, index)
  }
}
```

- [ ] **Step 2: Verify the file parses without errors**

```bash
node --input-type=module < tests/unit/RawDocBuilder.js 2>&1 || echo "parse error"
```

Expected: no output (or just the `parse error` line absent).

- [ ] **Step 3: Commit**

```bash
git add tests/unit/RawDocBuilder.js
git commit -m "test(es_utils): add RawDocBuilder fluent fixture for ES-free store setup"
```

---

## Task 2: Migrate `DocumentViewTabsMetadata.spec.js`

Replace the inline `makeRawDoc()` helper with `RawDocBuilder`. This is a pure swap — no test logic changes.

**Files:**
- Modify: `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata.spec.js`

- [ ] **Step 1: Update imports — remove `dirname`, add `RawDocBuilder`**

Remove this line:
```js
import { dirname } from 'path'
```

Add this line after the `CoreSetup` import:
```js
import RawDocBuilder from '~tests/unit/RawDocBuilder'
```

- [ ] **Step 2: Delete `makeRawDoc()` and replace all call sites**

Delete the `makeRawDoc` function (lines 26–47 in the current file):
```js
function makeRawDoc(overrides = {}) {
  return {
    _id: id,
    _index: index,
    _source: {
      type: 'Document',
      path: id,
      dirname: dirname(id),
      title: id,
      language: 'ENGLISH',
      extractionLevel: 0,
      metadata: {
        tika_metadata_resourcename: id,
        tika_metadata_another_metadata: null,
        tika_metadata_content_type: null,
        tika_metadata_dcterms_created: null,
        tika_metadata_dc_creator: null
      },
      ...overrides
    }
  }
}
```

Replace all four `makeRawDoc()` call sites:

- `makeRawDoc()` → `RawDocBuilder.build(id, index).toRaw()`
- `makeRawDoc({ language: 'FRENCH' })` → `RawDocBuilder.build(id, index).withLanguage('FRENCH').toRaw()`

- [ ] **Step 3: Run the spec**

```bash
yarn test:unit tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata.spec.js
```

Expected: 4 tests pass, duration well under 2s (was 11.7s).

- [ ] **Step 4: Commit**

```bash
git add tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata.spec.js
git commit -m "test(DocumentViewTabsMetadata): replace inline makeRawDoc() with RawDocBuilder"
```

---

## Task 3: Migrate `DocumentViewTabsViewer.spec.js`

All six tests follow the same pattern: commit a typed document to ES, call `getDocument()` to populate the store, then check `wrapper.vm.previewComponent`. The component reads from the store — no real ES needed.

**Files:**
- Modify: `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js`

- [ ] **Step 1: Swap imports**

Replace:
```js
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import DocumentViewTabsViewer from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer'
import { useDocumentStore } from '@/store/modules'
```

With:
```js
import CoreSetup from '~tests/unit/CoreSetup'
import RawDocBuilder from '~tests/unit/RawDocBuilder'
import DocumentViewTabsViewer from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer'
import { useDocumentStore } from '@/store/modules'
```

- [ ] **Step 2: Replace the `esConnectionHelper` setup and the `es` variable**

Replace:
```js
const { index, es } = esConnectionHelper.build()
const id = 'document'
const disabled = true
let core, documentStore
```

With:
```js
const index = 'test-index'
const id = 'document'
const disabled = true
let core, documentStore
```

- [ ] **Step 3: Rewrite all six tests**

Replace each test body. The pattern is always:

**Before:**
```js
const document = await letData(es)
  .have(new IndexedDocument(id, index).withContentType('<mime>'))
  .commitAndGetLastDocument()
await documentStore.getDocument({ id, index })
const wrapper = shallowMount(DocumentViewTabsViewer, {
  global: { plugins: core.plugins, renderStubDefaultSlot: true },
  props: { document, disabled }
})
expect(wrapper.vm.previewComponent).toBe('<ComponentName>')
```

**After:**
```js
documentStore.setDocument(RawDocBuilder.build(id, index).withContentType('<mime>').toRaw())
const document = documentStore.document
const wrapper = shallowMount(DocumentViewTabsViewer, {
  global: { plugins: core.plugins, renderStubDefaultSlot: true },
  props: { document, disabled }
})
expect(wrapper.vm.previewComponent).toBe('<ComponentName>')
```

Applied to each test:

```js
it('should call the DocumentViewerLegacySpreadsheet component for XLSX document', () => {
  documentStore.setDocument(
    RawDocBuilder.build(id, index)
      .withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .toRaw()
  )
  const document = documentStore.document
  const wrapper = shallowMount(DocumentViewTabsViewer, {
    global: { plugins: core.plugins, renderStubDefaultSlot: true },
    props: { document, disabled }
  })
  expect(wrapper.vm.previewComponent).toBe('DocumentViewerLegacySpreadsheet')
})

it('should call the DocumentViewerLegacySpreadsheet component for CSV document', () => {
  documentStore.setDocument(RawDocBuilder.build(id, index).withContentType('text/csv').toRaw())
  const document = documentStore.document
  const wrapper = shallowMount(DocumentViewTabsViewer, {
    global: { plugins: core.plugins, renderStubDefaultSlot: true },
    props: { document, disabled }
  })
  expect(wrapper.vm.previewComponent).toBe('DocumentViewerLegacySpreadsheet')
})

it('should call the DocumentViewerPaginated component for Word document', () => {
  documentStore.setDocument(RawDocBuilder.build(id, index).withContentType('application/msword').toRaw())
  const document = documentStore.document
  const wrapper = shallowMount(DocumentViewTabsViewer, {
    global: { plugins: core.plugins, renderStubDefaultSlot: true },
    props: { document, disabled }
  })
  expect(wrapper.vm.previewComponent).toBe('DocumentViewerPaginated')
})

it('should call the DocumentViewerTiff component for TIFF document', () => {
  documentStore.setDocument(RawDocBuilder.build(id, index).withContentType('image/tiff').toRaw())
  const document = documentStore.document
  const wrapper = shallowMount(DocumentViewTabsViewer, {
    global: { plugins: core.plugins, renderStubDefaultSlot: true },
    props: { document, disabled }
  })
  expect(wrapper.vm.previewComponent).toBe('DocumentViewerTiff')
})

it('should call the DocumentViewerAudio component for audio document', () => {
  documentStore.setDocument(RawDocBuilder.build(id, index).withContentType('audio/ogg').toRaw())
  const document = documentStore.document
  const wrapper = shallowMount(DocumentViewTabsViewer, {
    global: { plugins: core.plugins, renderStubDefaultSlot: true },
    props: { document, disabled }
  })
  expect(wrapper.vm.previewComponent).toBe('DocumentViewerAudio')
})

it('should call the DocumentViewerVideo component for video document', () => {
  documentStore.setDocument(RawDocBuilder.build(id, index).withContentType('video/mp4').toRaw())
  const document = documentStore.document
  const wrapper = shallowMount(DocumentViewTabsViewer, {
    global: { plugins: core.plugins, renderStubDefaultSlot: true },
    props: { document, disabled }
  })
  expect(wrapper.vm.previewComponent).toBe('DocumentViewerVideo')
})
```

Since the tests are now synchronous, remove `async` from all `it()` callbacks (they don't have it already — confirm no `await` remains).

- [ ] **Step 4: Run the spec**

```bash
yarn test:unit tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js
```

Expected: 6 tests pass, no ES connection needed.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js
git commit -m "test(DocumentViewTabsViewer): replace ES round-trips with RawDocBuilder store setup"
```

---

## Task 4: Migrate `DocumentViewTabsEntities.spec.js`

The component reads its document from the store and fetches named entities via `api.elasticsearch.getDocumentNamedEntitiesInCategory`. We replace ES doc indexing with `documentStore.setDocument()` and mock the NER API for all tests.

**Files:**
- Modify: `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities.spec.js`

- [ ] **Step 1: Swap imports**

Replace:
```js
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
```

With:
```js
import RawDocBuilder from '~tests/unit/RawDocBuilder'
```

- [ ] **Step 2: Replace the `esConnectionHelper` setup**

Replace:
```js
const { index, es: elasticsearch } = esConnectionHelper.build()
```

With:
```js
const index = 'test-index'
```

- [ ] **Step 3: Add a `nerHit` helper and move spy mock into top-level `beforeEach`**

Add this helper function at the top of the `describe` block (before `beforeEach`):

```js
function nerHit(mention, category, routing = id) {
  return {
    _index: index,
    _type: '_doc',
    _id: mention + '-' + category,
    _score: 1,
    _routing: routing,
    _source: {
      extractorLanguage: 'ENGLISH',
      mentionNorm: mention.toLowerCase(),
      mention,
      offsets: [0],
      category,
      type: 'NamedEntity',
      join: { parent: routing, name: 'NamedEntity' },
      isHidden: false
    }
  }
}

function nerResponse(hits = []) {
  return { hits: { total: { value: hits.length, relation: 'eq' }, max_score: 1, hits } }
}
```

In `beforeEach`, keep the existing `spy` setup and add a default mock that returns empty results for all categories (can be overridden per test):

```js
beforeEach(() => {
  const routes = [
    { name: 'document', path: '/' },
    { name: 'task.entities.new', path: '/task/entities/new' }
  ]

  id = uniqueId('document-')
  spy = vi.spyOn(api.elasticsearch, 'getDocumentNamedEntitiesInCategory')
  spy.mockResolvedValue(nerResponse())  // default: empty for all categories
  core = CoreSetup.init().useAll().useRouter(routes)
  core.config.set('manageDocuments', true)
  documentStore = useDocumentStore()
})
```

- [ ] **Step 4: Rewrite the four top-level tests**

**Test 1 — `it.skip` stays skipped, no change needed** (it tests filtered NER which requires real data flow).

**Test 2 — "should display named entities in the dedicated tab":**

Replace:
```js
it('should display named entities in the dedicated tab', async () => {
  await letData(elasticsearch)
    .have(
      new IndexedDocument(id, index)
        .withPipeline('CORENLP')
        .withNer('mention_01', 0, 'PERSON')
        .withNer('mention_02', 0, 'ORGANIZATION')
        .withNer('mention_03', 0, 'LOCATION')
    )
    .commit()

  await documentStore.getDocument({ id, index })
  await documentStore.getFirstPageForNamedEntityInAllCategories()
  ...
```

With:
```js
it('should display named entities in the dedicated tab', async () => {
  spy.mockImplementation((_idx, _docId, _routing, _from, _size, category) => {
    const byCategory = {
      PERSON: [nerHit('mention_01', 'PERSON')],
      ORGANIZATION: [nerHit('mention_02', 'ORGANIZATION')],
      LOCATION: [nerHit('mention_03', 'LOCATION')],
      EMAIL: []
    }
    return Promise.resolve(nerResponse(byCategory[category] ?? []))
  })

  documentStore.setDocument(RawDocBuilder.build(id, index).withPipeline('CORENLP').toRaw())
  await documentStore.getFirstPageForNamedEntityInAllCategories()
  ...
```

**Test 3 — "should contains a specific text when no NER task has been run":**

Replace:
```js
it('should contains a specific text when no NER task has been run on that document', async () => {
  await letData(elasticsearch).have(new IndexedDocument(id, index)).commit()
  await documentStore.getDocument({ id, index })
  await documentStore.getFirstPageForNamedEntityInAllCategories()
  ...
```

With:
```js
it('should contains a specific text when no NER task has been run on that document', async () => {
  documentStore.setDocument(RawDocBuilder.build(id, index).toRaw())
  await documentStore.getFirstPageForNamedEntityInAllCategories()
  ...
```

**Test 4 — "should display an error message if no named entities":**

Replace:
```js
it('should display an error message if no named entities has been found after names finding task', async () => {
  await letData(elasticsearch).have(new IndexedDocument(id, index).withPipeline('CORENLP')).commit()
  await documentStore.getDocument({ id, index })
  await documentStore.getFirstPageForNamedEntityInAllCategories()
  ...
```

With:
```js
it('should display an error message if no named entities has been found after names finding task', async () => {
  documentStore.setDocument(RawDocBuilder.build(id, index).withPipeline('CORENLP').toRaw())
  await documentStore.getFirstPageForNamedEntityInAllCategories()
  ...
```

- [ ] **Step 5: Rewrite the two "with mocking the API" tests**

These already mock `spy`. Replace their document setup lines only:

**Test "should call the api to get named entities":**

Replace:
```js
await letData(elasticsearch)
  .have(
    new IndexedDocument(id, index)
      .withPipeline('CORENLP')
      .withNer('london', 0, 'LOCATION')
      .withNer('london', 10, 'LOCATION')
  )
  .commit()
await documentStore.getDocument({ id, index })
await documentStore.getFirstPageForNamedEntityInAllCategories()
```

With:
```js
documentStore.setDocument(RawDocBuilder.build(id, index).withPipeline('CORENLP').toRaw())
await documentStore.getFirstPageForNamedEntityInAllCategories()
```

**Test "should call the api to get filtered named entities":** same swap — replace the `letData` + `getDocument` block with:

```js
documentStore.setDocument(RawDocBuilder.build(id, index).withPipeline('CORENLP').toRaw())
await documentStore.getFirstPageForNamedEntityInAllCategories()
```

- [ ] **Step 6: Run the spec**

```bash
yarn test:unit tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities.spec.js
```

Expected: 5 tests pass (1 skipped), no ES connection needed.

- [ ] **Step 7: Commit**

```bash
git add tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities.spec.js
git commit -m "test(DocumentViewTabsEntities): replace ES round-trips with RawDocBuilder + mocked NER API"
```

---

## Task 5: Migrate `DocumentContent.spec.js`

The shared helper `mockDocumentContentSlice` indexes a document to ES and fetches it back. The component receives the document as a prop. We replace the ES portion with `documentStore.setDocument()`.

**Files:**
- Modify: `tests/unit/specs/components/Document/DocumentContent.spec.js`

- [ ] **Step 1: Swap imports**

Replace:
```js
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
```

With:
```js
import RawDocBuilder from '~tests/unit/RawDocBuilder'
```

- [ ] **Step 2: Replace the `esConnectionHelper` setup**

Replace:
```js
const { index, es } = esConnectionHelper.build()
const id = 'document'
```

With:
```js
const index = 'test-index'
const id = 'document'
```

- [ ] **Step 3: Rewrite `mockDocumentContentSlice`**

Replace:
```js
async function mockDocumentContentSlice(content = '', { language = 'ENGLISH' } = {}) {
  const contentSlice = letTextContent().withContent(content).getResponse()
  // Index the document
  await letData(es).have(new IndexedDocument(id, index).withContent(content).withLanguage(language)).commit()
  // Mock the `getDocumentSlice` method
  api.getDocumentSlice.mockImplementation(async (project, documentId, offset, limit) => {
    // Modify the returned content according to passed parameters
    const content = contentSlice.content.substring(offset, offset + limit)
    return { ...contentSlice, content, offset, limit }
  })
  // Get the document from the store
  await documentStore.getDocument({ id, index })
  const document = documentStore.document
  // Finally flush all promises and return all necessary values
  await flushPromises()
  return { content, contentSlice, document }
}
```

With:
```js
async function mockDocumentContentSlice(content = '', { language = 'ENGLISH' } = {}) {
  const contentSlice = letTextContent().withContent(content).getResponse()
  documentStore.setDocument(
    RawDocBuilder.build(id, index).withContent(content).withLanguage(language).toRaw()
  )
  api.getDocumentSlice.mockImplementation(async (project, documentId, offset, limit) => {
    const slicedContent = contentSlice.content.substring(offset, offset + limit)
    return { ...contentSlice, content: slicedContent, offset, limit }
  })
  const document = documentStore.document
  await flushPromises()
  return { content, contentSlice, document }
}
```

Note: renamed inner `content` shadow to `slicedContent` to avoid shadowing the outer `content` parameter.

- [ ] **Step 4: Run the spec**

```bash
yarn test:unit tests/unit/specs/components/Document/DocumentContent.spec.js
```

Expected: all tests pass, no ES connection needed.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/specs/components/Document/DocumentContent.spec.js
git commit -m "test(DocumentContent): replace ES round-trips with RawDocBuilder store setup"
```

---

## Task 6: Verify full suite still passes

- [ ] **Step 1: Run the full test suite**

```bash
yarn test:unit
```

Expected: all tests pass (192 files, same pass/skip counts as before). Watch for any regressions in the four migrated files or in tests that import from `es_utils`.

- [ ] **Step 2: Note the new wall-clock time**

Record it and compare to the `slow-tests.md` milestone table (current best: 262s).
