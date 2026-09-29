<script setup>
import { computed, onBeforeUnmount, ref, toRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { syntaxHighlighting } from '@codemirror/language'
import { classHighlighter } from '@lezer/highlight'

import { useDocumentSource } from '@/composables/useDocumentSource'
import { findLanguage } from '@/utils/codeLanguage'

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

const { fetchSource } = useDocumentSource()
const { t } = useI18n()

const editor = useTemplateRef('editor')
const error = ref(null)
const loading = ref(false)
const tooLarge = computed(() => isTooLarge(props.document))

let view = null
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
      language ?? []
    ]
  })
}

function renderSource(text, language) {
  const state = createState(text, language)
  if (view) {
    view.setState(state)
  }
  else {
    view = new EditorView({ state, parent: editor.value })
  }
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
// only the newest load may write its text or its failure.
async function load(document) {
  const id = ++lastLoad
  error.value = null
  loading.value = !isTooLarge(document)
  if (loading.value) {
    await showSource(id, document)
  }
  if (isCurrentLoad(id)) {
    loading.value = false
  }
}

watch(toRef(props, 'document'), load, { immediate: true, flush: 'post' })

onBeforeUnmount(() => view?.destroy())
</script>

<template>
  <div class="document-viewer-code">
    <div
      v-if="tooLarge"
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
      v-show="!tooLarge && !error && !loading"
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
