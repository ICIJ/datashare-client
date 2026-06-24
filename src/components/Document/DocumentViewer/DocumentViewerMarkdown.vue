<script setup>
import { ref, watch } from 'vue'

import { useDocumentSource } from '@/composables/useDocumentSource'
import { renderMarkdown } from '@/utils/markdown'

/**
 * Display a Markdown document as safely-sanitized formatted HTML.
 */
const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object,
    default: null
  }
})

const { fetchSource } = useDocumentSource()

const html = ref('')
const error = ref(null)
const loading = ref(false)

async function load(document) {
  if (!document) {
    return
  }
  loading.value = true
  error.value = null
  try {
    const source = await fetchSource(document, { responseType: 'text' })
    html.value = await renderMarkdown(source)
  }
  catch (e) {
    error.value = e.message
  }
  finally {
    loading.value = false
  }
}

// Re-fetch whenever the document changes, not only on mount, so navigating
// between markdown documents in the same viewer instance updates the content.
watch(() => props.document, load, { immediate: true })
</script>

<template>
  <div class="markdown-viewer py-3">
    <div
      v-if="error"
      class="markdown-viewer__error p-3 text-center"
    >
      {{ error }}
    </div>
    <div
      v-else-if="loading"
      class="markdown-viewer__loading p-3 text-center"
    >
      <b-spinner />
    </div>
    <!--
      Safe to use v-html here: `html` is the output of renderMarkdown(), which
      sanitizes the content (no raw HTML, no remote images, hardened links).
    -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-else
      class="markdown-viewer__content shadow-sm border p-3 mx-auto"
      v-html="html"
    />
  </div>
</template>

<style lang="scss">
.markdown-viewer {
  max-width: 100%;
  overflow-x: auto;

  &__content {
    max-width: 1012px;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: $spacer;
    }

    table {
      border-collapse: collapse;

      th,
      td {
        border: 1px solid var(--bs-border-color);
        padding: $spacer-xxs $spacer-xs;
      }
    }

    pre {
      padding: $spacer;
      overflow-x: auto;
      background: var(--bs-tertiary-bg);
      border-radius: var(--bs-border-radius);
    }

    blockquote {
      margin: 0;
      padding-left: $spacer;
      border-left: 4px solid var(--bs-border-color);
    }
  }
}
</style>
