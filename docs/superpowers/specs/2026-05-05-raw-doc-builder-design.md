# RawDocBuilder — Design Spec

**Date:** 2026-05-05  
**Branch:** chore/optimize-tests  
**Author:** Caroline Desprat

---

## Problem

Several slow test files build documents by making real Elasticsearch round-trips:

```js
await letData(es).have(new IndexedDocument(id, index)).commit()
await documentStore.getDocument({ id, index })
```

Many of the components under test only read from the document store — they never need a live ES index. The ES calls add ~1–3 seconds per test file and require `esConnectionHelper`, which serialises teardown across the suite.

`IndexedDocument.toRaw()` already converts a builder to the raw hit shape `{ _id, _index, _source }` that `documentStore.setDocument()` accepts, but importing `es_utils` pulls in `EsDocList → Document → iconFiles`, which is heavy enough to slow down test files that don't otherwise need it.

---

## Goal

A **lightweight, standalone fluent builder** that produces the `{ _id, _index, _source }` raw ES hit shape without any heavy imports, so tests can seed the document store directly.

---

## File

`tests/unit/RawDocBuilder.js`

Imports: `path` (node built-in), `uniqueId` from lodash. Nothing else.

---

## API

Static factory, same signature and defaults as `IndexedDocument`:

```js
RawDocBuilder.build(path?, index?)
```

Fluent setters — all return `this`:

| Method | Effect on `_source` |
|--------|---------------------|
| `.withContent(content)` | sets `content`, `contentTextLength` |
| `.withContentLength(length)` | sets `contentLength` |
| `.withContentType(contentType)` | sets `contentType` (trimmed before `;`), `metadata.tika_metadata_content_type`; if charset present, also sets `contentEncoding` |
| `.withIndexingDate(date)` | sets `extractionDate` |
| `.withResourceName(name)` | sets `metadata.tika_metadata_resourcename` |
| `.withAuthor(author)` | sets `metadata.tika_metadata_dc_creator` |
| `.withCreationDate(date)` | sets `metadata.tika_metadata_dcterms_created` |
| `.withOtherMetadata(value)` | sets `metadata.tika_metadata_another_metadata` |
| `.withMetadata(obj)` | merges `obj` into `metadata` (obj fields take lower priority than existing ones, matching `IndexedDocument` behaviour) |
| `.withLanguage(language)` | sets `language` |
| `.withNoContentTranslated()` | sets `content_translated: []` |
| `.withContentTranslated(content, srcLang, tgtLang)` | appends `{ content, source_language, target_language }` to `content_translated` |
| `.withNer(mention, offset?, category?, isHidden?)` | appends pipeline tag string to `nerTags[]` — NER detail is a separate ES child hit, not embedded in the document source |
| `.withParent(parentId)` | sets `parentDocument: parentId`, `extractionLevel: 1` |
| `.withRoot(rootId)` | sets `rootDocument: rootId` |
| `.withPipeline(pipeline)` | appends `pipeline` to `nerTags[]` |
| `.withTags(tags)` | sets `tags` |

Terminal method:

```js
.toRaw()  // → { _id: path, _index: index, _source: { ...fields } }
```

---

## Default `_source`

Produced by `RawDocBuilder.build(path, index)` before any `with*` calls:

```js
{
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
```

---

## NER detail

`withNer(mention, offset, category, isHidden)` only appends to `nerTags[]` (pipeline tag strings). The `nerList` in `IndexedDocument` is used solely by `IndexBuilder.commit()` to write separate named-entity child documents to ES — that concern does not exist in a store-only test.

---

## Migration targets

Files to migrate after the builder is in place (from `slow-tests.md`):

| File | Current duration | ES calls |
|------|-----------------|----------|
| `DocumentViewTabsEntities.spec.js` | 3.0s (rank 16) | ~13 |
| `DocumentContent.spec.js` | 6.5s (rank 6) | ~4 |
| `DocumentViewTabsViewer.spec.js` | — | ~15 |
| `DocumentViewTabsMetadata.spec.js` | already migrated — replace inline `makeRawDoc()` with `RawDocBuilder.build().toRaw()` |

---

## What this is not

- Not a replacement for `IndexedDocument` in tests that actually need to write to ES (integration tests, NER tests using `IndexBuilder`)
- Not exported from `es_utils.js` — lives in its own file to stay import-light
- No test file for the builder itself — it is a pure data factory verified by the consuming specs
