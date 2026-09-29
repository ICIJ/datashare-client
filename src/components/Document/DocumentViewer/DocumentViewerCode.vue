<script setup>
import { computed, onBeforeUnmount, ref, toRaw, toRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Compartment, EditorState, StateEffect, StateField } from '@codemirror/state'
import { Decoration, EditorView, lineNumbers } from '@codemirror/view'
import { syntaxHighlighting } from '@codemirror/language'
import { classHighlighter } from '@lezer/highlight'

import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { useDocumentPreview } from '@/composables/useDocumentPreview'
import { useDocumentSource } from '@/composables/useDocumentSource'
import { findLanguage } from '@/utils/codeLanguage'
import { buildSearchIndex, findIndexMatches } from '@/utils/codeSearchIndex'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'

/**
 * Display a text or code document as read-only, highlighted source.
 */
const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object,
    required: true
  },
  compactThreshold: {
    type: Number,
    default: 770
  }
})

const MAX_CONTENT_LENGTH = 50 * 1024 * 1024
const TRAILING_LINE_BREAK = /(?:\r\n?|\n)$/

const MARK = Decoration.mark({ class: 'local-search-term' })
const ACTIVE_MARK = Decoration.mark({ class: 'local-search-term--active' })

// The document never changes once shown (a new document gets a new state), so
// the marks never have to be mapped through a change.
function defineMarksField(setMarks) {
  return StateField.define({
    create: () => Decoration.none,
    update: (marks, transaction) => {
      const effect = transaction.effects.find(effect => effect.is(setMarks))
      return effect ? effect.value : marks
    },
    provide: field => EditorView.decorations.from(field)
  })
}

// The active mark lives apart from the others: moving to the next occurrence
// repaints one range instead of every match of the document.
const setMarks = StateEffect.define()
const setActiveMark = StateEffect.define()
const marksField = defineMarksField(setMarks)
const activeMarkField = defineMarksField(setActiveMark)
const languageCompartment = new Compartment()

const { fetchSource } = useDocumentSource()
const { isBlurred, getBlurredContentBanner } = useDocumentPreview()
const { t } = useI18n()

const editor = useTemplateRef('editor')
const error = ref(null)
const loading = ref(false)
const blurred = ref(false)
const blurredContent = ref(null)
const downloadTooLarge = ref(false)
const tooLarge = computed(() => isTooLarge(props.document) || downloadTooLarge.value)

const {
  term,
  activeIndex,
  matches,
  occurrences,
  isLoading,
  refresh
} = useDocumentLocalSearch({ findMatches })

let view = null
let searchableDoc = null
let searchIndex = null
let lastLoad = 0
let loadController = null

function isTooLarge({ contentLength }) {
  return contentLength > MAX_CONTENT_LENGTH
}

// Tika reports encodings by names the browser mostly knows; the ones it does
// not are read as UTF-8, the encoding a source without a label most likely has.
function decodeSource(bytes, { source }) {
  try {
    return new TextDecoder(source?.contentEncoding ?? 'utf-8').decode(bytes)
  }
  catch {
    return new TextDecoder().decode(bytes)
  }
}

// A file ends with a line break by convention: shown as is, it would add an
// empty numbered line after the last one, which GitHub does not show either.
function dropTrailingLineBreak(text) {
  return text.replace(TRAILING_LINE_BREAK, '')
}

function createState(text) {
  return EditorState.create({
    doc: dropTrailingLineBreak(text),
    extensions: [
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      lineNumbers(),
      syntaxHighlighting(classHighlighter),
      // Listed first, the active mark wraps inside the plain one and its color
      // shows on top.
      activeMarkField,
      marksField,
      languageCompartment.of([])
    ]
  })
}

function renderSource(text) {
  const state = createState(text)
  if (view) {
    view.setState(state)
  }
  else {
    view = new EditorView({ state, parent: editor.value })
  }
  searchableDoc = state.doc
}

function isCurrentLoad(id) {
  return id === lastLoad
}

// The length of an embedded document is often unknown until it is downloaded,
// so the download itself stops once it grows past the limit.
function fetchBoundedSource(document) {
  const controller = loadController
  const onDownloadProgress = ({ loaded }) => {
    if (loaded > MAX_CONTENT_LENGTH) {
      downloadTooLarge.value = true
      controller.abort()
    }
  }
  const config = { responseType: 'arraybuffer', signal: controller.signal, onDownloadProgress }
  return fetchSource(document, config)
}

// The colors come in when the language pack is loaded: the text does not wait
// for them.
async function highlightSource(id, languagePromise) {
  const language = await languagePromise
  if (isCurrentLoad(id) && language) {
    view.dispatch({ effects: languageCompartment.reconfigure(language) })
  }
}

async function showSource(id, document) {
  const languagePromise = findLanguage(document)
  try {
    const text = decodeSource(await fetchBoundedSource(document), document)
    if (isCurrentLoad(id)) {
      renderSource(text)
      highlightSource(id, languagePromise)
    }
  }
  catch (reason) {
    if (isCurrentLoad(id) && !downloadTooLarge.value) {
      error.value = reason.message
    }
  }
}

function startLoad() {
  loadController?.abort()
  loadController = new AbortController()
  downloadTooLarge.value = false
  return ++lastLoad
}

function stopLoad() {
  lastLoad++
  loadController?.abort()
}

// A document swapped in while this one was loading owns the editor now, so
// only the newest load may write its text, its failure or its matches.
async function load(document) {
  const id = startLoad()
  searchableDoc = null
  searchIndex = null
  error.value = null
  loading.value = !isTooLarge(document)
  if (loading.value) {
    await showSource(id, document)
  }
  if (isCurrentLoad(id)) {
    loading.value = false
    // The matches on screen point into the text this load replaced.
    await refresh()
  }
}

// Indexing a 50 MB source takes a noticeable moment, so it waits for the
// first term instead of delaying every document that is only read.
function findMatches(value) {
  // Counting the matches of a blurred source would tell what it hides.
  if (!searchableDoc || blurred.value) {
    return []
  }
  searchIndex ??= buildSearchIndex(searchableDoc)
  return findIndexMatches(searchIndex, searchableDoc, value).map(match => ({ page: 1, ...match }))
}

// A common term in a large source has millions of matches: reading them
// through the reactive proxy would wrap each of them on every paint.
function paintMatches() {
  const ranges = toRaw(matches.value).map(({ from, to }) => MARK.range(from, to))
  view?.dispatch({ effects: setMarks.of(Decoration.set(ranges)) })
}

function paintActiveMatch() {
  const active = toRaw(matches.value)[activeIndex.value - 1]
  if (!view) {
    return
  }
  const ranges = active ? [ACTIVE_MARK.range(active.from, active.to)] : []
  const effects = [setActiveMark.of(Decoration.set(ranges))]
  if (active) {
    effects.push(EditorView.scrollIntoView(active.from, { y: 'center' }))
  }
  view.dispatch({ effects })
}

watch(blurred, refresh)
watch(matches, paintMatches)
watch([matches, activeIndex], paintActiveMatch)
watch(toRef(props, 'document'), load, { immediate: true, flush: 'post' })
watch(toRef(props, 'document'), async (document) => {
  blurred.value = await isBlurred(document)
  blurredContent.value = blurred.value ? await getBlurredContentBanner(document) : null
}, { immediate: true })

onBeforeUnmount(() => {
  stopLoad()
  view?.destroy()
})

defineExpose({ findMatches })
</script>

<template>
  <div class="document-viewer-code">
    <document-toolbox
      v-model="term"
      v-model:active-index="activeIndex"
      :document="document"
      :occurrences="occurrences"
      :loading="isLoading"
      :disabled="blurred"
      :compact-threshold="compactThreshold"
      no-count
    />
    <dismissable-content-warning-toggler
      v-if="blurred"
      v-model="blurred"
      :description="blurredContent"
    />
    <div
      v-else-if="tooLarge"
      class="document-viewer-code__too-large text-center p-3"
    >
      {{ t('document.tooLargeToPreview') }}
    </div>
    <div
      v-else-if="error"
      class="document-viewer-code__error text-center p-3"
    >
      {{ error }}
    </div>
    <div
      v-else-if="loading"
      class="document-viewer-code__loading text-center p-3"
    >
      <b-spinner />
    </div>
    <div
      v-show="!blurred && !tooLarge && !error && !loading"
      ref="editor"
      class="document-viewer-code__editor"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-viewer-code {
  --document-viewer-code-keyword: #cf222e;
  --document-viewer-code-string: #0a3069;
  --document-viewer-code-comment: #6e7781;
  --document-viewer-code-number: #0550ae;
  --document-viewer-code-type: #116329;
  --document-viewer-code-class: #953800;
  --document-viewer-code-property: #0550ae;
  --document-viewer-code-definition: #8250df;
  --document-viewer-code-invalid: #82071e;

  width: 100%;

  &__editor:deep(.cm-editor) {
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    border: $border-width solid var(--bs-border-color);
    border-radius: $border-radius-sm;
  }

  &__editor:deep(.cm-gutters) {
    border-top-left-radius: $border-radius-sm;
    border-bottom-left-radius: $border-radius-sm;
    background: var(--bs-tertiary-bg);
    color: var(--bs-secondary-color);
    border-right-color: var(--bs-border-color);
  }

  &__editor:deep(.tok-keyword) {
    color: var(--document-viewer-code-keyword);
  }

  &__editor:deep(.tok-string),
  &__editor:deep(.tok-string2) {
    color: var(--document-viewer-code-string);
  }

  &__editor:deep(.tok-comment),
  &__editor:deep(.tok-meta) {
    color: var(--document-viewer-code-comment);
    font-style: italic;
  }

  &__editor:deep(.tok-number),
  &__editor:deep(.tok-bool),
  &__editor:deep(.tok-atom) {
    color: var(--document-viewer-code-number);
  }

  &__editor:deep(.tok-typeName),
  &__editor:deep(.tok-namespace) {
    color: var(--document-viewer-code-type);
  }

  &__editor:deep(.tok-className),
  &__editor:deep(.tok-macroName) {
    color: var(--document-viewer-code-class);
  }

  &__editor:deep(.tok-propertyName) {
    color: var(--document-viewer-code-property);
  }

  &__editor:deep(.tok-definition),
  &__editor:deep(.tok-variableName2) {
    color: var(--document-viewer-code-definition);
  }

  &__editor:deep(.tok-invalid) {
    color: var(--document-viewer-code-invalid);
  }

  &__editor:deep(.local-search-term) {
    background: $mark-bg;
    color: black;
  }

  &__editor:deep(.local-search-term--active) {
    background: #38d878;
    color: white;
  }
}

@include color-mode(dark) {
  .document-viewer-code {
    --document-viewer-code-keyword: #ff7b72;
    --document-viewer-code-string: #a5d6ff;
    --document-viewer-code-comment: #8b949e;
    --document-viewer-code-number: #79c0ff;
    --document-viewer-code-type: #7ee787;
    --document-viewer-code-class: #ffa657;
    --document-viewer-code-property: #79c0ff;
    --document-viewer-code-definition: #d2a8ff;
    --document-viewer-code-invalid: #ffa198;
  }
}
</style>
