<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/useCore'
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

const { t } = useI18n()
const core = useCore()

const html = ref('')
const error = ref(null)

onMounted(async () => {
  try {
    const source = await core.api.getSource(props.document, { responseType: 'text' })
    html.value = renderMarkdown(source)
  }
  catch (e) {
    if (e?.response?.status === 404) {
      error.value = t('document.errorNotFound')
    }
    else {
      error.value = t('document.notAvailable')
    }
  }
})
</script>

<template>
  <div class="markdown-viewer py-3">
    <div
      v-if="error"
      class="markdown-viewer__error p-3 text-center"
    >
      {{ error }}
    </div>
    <!--
      Safe to use v-html here: `html` is the output of renderMarkdown(), which
      sanitizes the content (no raw HTML, no remote images, hardened links).
    -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-else
      class="markdown-viewer__content"
      v-html="html"
    />
  </div>
</template>

<style lang="scss">
.markdown-viewer {
  max-width: 100%;
  overflow-x: auto;

  &__content {
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

    img {
      max-width: 100%;
    }
  }
}
</style>
