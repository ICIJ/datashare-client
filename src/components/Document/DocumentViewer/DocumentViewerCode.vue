<script setup>
import { computed, onBeforeUnmount, ref, toRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { EditorState, StateEffect, StateField } from '@codemirror/state'
import { Decoration, EditorView, lineNumbers } from '@codemirror/view'
import { syntaxHighlighting } from '@codemirror/language'
import { classHighlighter } from '@lezer/highlight'

import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { useDocumentPreview } from '@/composables/useDocumentPreview'
import { useDocumentSource } from '@/composables/useDocumentSource'
import { findLanguage } from '@/utils/codeLanguage'
import { findFoldedMatches, foldWithSourceIndexes } from '@/utils/strings'
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

const MARK = Decoration.mark({ class: 'local-search-term' })
const ACTIVE_MARK = Decoration.mark({ class: 'local-search-term local-search-term--active' })

const setMarks = StateEffect.define()

// The document never changes once shown (a new document gets a new state), so
// the marks never have to be mapped through a change.
const marksField = StateField.define({
  create: () => Decoration.none,
  update: (marks, transaction) => {
    const effect = transaction.effects.find(effect => effect.is(setMarks))
    return effect ? effect.value : marks
  },
  provide: field => EditorView.decorations.from(field)
})

const { fetchSource } = useDocumentSource()
const { isBlurred, getBlurredContentBanner } = useDocumentPreview()
const { t } = useI18n()

const editor = useTemplateRef('editor')
const error = ref(null)
const loading = ref(false)
const blurred = ref(false)
const blurredContent = ref(null)
const tooLarge = computed(() => isTooLarge(props.document))

const {
  term,
  activeIndex,
  matches,
  occurrences,
  isLoading,
  refresh
} = useDocumentLocalSearch({ findMatches })

let view = null
let foldedLines = []
let lastLoad = 0

function isTooLarge({ contentLength }) {
  return contentLength > MAX_CONTENT_LENGTH
}

function createState(text, language) {
  return EditorState.create({
    doc: text,
    extensions: [
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      lineNumbers(),
      syntaxHighlighting(classHighlighter),
      marksField,
      language ?? []
    ]
  })
}

// Folding keeps two offset arrays per character, too heavy to hold for a 50 MB
// file, so only the folded strings are kept and `findMatches` rebuilds the
// offsets for the lines a term actually hits.
function foldLines(doc) {
  return Array.from(doc.iterLines(), line => foldWithSourceIndexes(line).folded)
}

function renderSource(text, language) {
  const state = createState(text, language)
  if (view) {
    view.setState(state)
  }
  else {
    view = new EditorView({ state, parent: editor.value })
  }
  foldedLines = foldLines(state.doc)
}

function isCurrentLoad(id) {
  return id === lastLoad
}

async function showSource(id, document) {
  try {
    const [text, language] = await Promise.all([
      fetchSource(document, { responseType: 'text' }),
      findLanguage(document)
    ])
    if (isCurrentLoad(id)) {
      renderSource(text, language)
    }
  }
  catch (reason) {
    if (isCurrentLoad(id)) {
      error.value = reason.message
    }
  }
}

// A document swapped in while this one was loading owns the editor now, so
// only the newest load may write its text, its failure or its matches.
async function load(document) {
  const id = ++lastLoad
  foldedLines = []
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

function findLineMatches(index, foldedTerm) {
  const line = view.state.doc.line(index + 1)
  return findFoldedMatches(line.text, foldedTerm).map(({ start, end }) => {
    return { page: 1, from: line.from + start, to: line.from + end }
  })
}

function findMatches(value) {
  const { folded } = foldWithSourceIndexes(value)
  // A term made only of combining marks folds to nothing, which every line
  // contains at every position: the scan would never move forward.
  if (!folded) {
    return []
  }
  return foldedLines.flatMap((foldedLine, index) => {
    if (!foldedLine.includes(folded)) {
      return []
    }
    return findLineMatches(index, folded)
  })
}

function paintMatches() {
  if (!view) {
    return
  }
  const active = matches.value[activeIndex.value - 1]
  const ranges = matches.value.map((match) => {
    const mark = match === active ? ACTIVE_MARK : MARK
    return mark.range(match.from, match.to)
  })
  const effects = [setMarks.of(Decoration.set(ranges))]
  if (active) {
    effects.push(EditorView.scrollIntoView(active.from, { y: 'center' }))
  }
  view.dispatch({ effects })
}

watch([matches, activeIndex], paintMatches)
watch(toRef(props, 'document'), load, { immediate: true, flush: 'post' })
watch(toRef(props, 'document'), async (document) => {
  blurred.value = await isBlurred(document)
  blurredContent.value = blurred.value ? await getBlurredContentBanner(document) : null
}, { immediate: true })

onBeforeUnmount(() => view?.destroy())

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
  }

  &__editor:deep(.cm-gutters) {
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
