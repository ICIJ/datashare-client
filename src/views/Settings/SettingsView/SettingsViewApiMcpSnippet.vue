<script setup>
import { computed } from 'vue'
import { computedAsync } from '@vueuse/core'
import { HapticCopy } from '@icij/murmur'
import { useI18n } from 'vue-i18n'
import { LanguageDescription } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { classHighlighter, highlightCode } from '@lezer/highlight'

/**
 * A read-only, highlighted code snippet with a copy button.
 */
defineOptions({ name: 'SettingsViewApiMcpSnippet' })

const { code, language } = defineProps({
  /**
   * The code to display and copy
   */
  code: {
    type: String,
    required: true
  },
  /**
   * The CodeMirror name of the language to highlight the code with
   */
  language: {
    type: String,
    required: true
  }
})

const { t } = useI18n()

function plainTokens(text) {
  return [{ text, classes: '' }]
}

async function loadParser(name) {
  const description = LanguageDescription.matchLanguageName(languages, name, false)
  const support = await description.load()
  return support.language.parser
}

function highlightTokens(text, parser) {
  const tokens = []
  const putText = (text, classes) => tokens.push({ text, classes })
  const putBreak = () => tokens.push({ text: '\n', classes: '' })
  highlightCode(text, parser.parse(text), classHighlighter, putText, putBreak)
  return tokens
}

async function highlightSnippet() {
  const text = code
  const parser = await loadParser(language)
  return { text, tokens: highlightTokens(text, parser) }
}

// The snippet is readable before its language pack loads, and stays plain
// text if the pack fails to load: only the colors are lost. Highlighted
// tokens of a previous code are never shown.
const highlighted = computedAsync(highlightSnippet, null, { onError: () => {} })
const tokens = computed(() => {
  const isHighlighted = highlighted.value?.text === code
  return isHighlighted ? highlighted.value.tokens : plainTokens(code)
})
</script>

<template>
  <div class="settings-view-api-mcp-snippet position-relative">
    <pre class="settings-view-api__mcp__snippet bg-body-tertiary border rounded p-3 pe-5 m-0"><code><span
      v-for="(token, index) in tokens"
      :key="index"
      :class="token.classes"
    >{{ token.text }}</span></code></pre>
    <haptic-copy
      :text="code"
      :label="t('settings.api.key.copy')"
      class="settings-view-api-mcp-snippet__copy btn-outline-action position-absolute top-0 end-0 m-2"
      hide-label
      size="sm"
    />
  </div>
</template>

<style lang="scss" scoped>
.settings-view-api-mcp-snippet {
  --settings-view-api-mcp-snippet-string: #0a3069;
  --settings-view-api-mcp-snippet-property: #0550ae;
  --settings-view-api-mcp-snippet-atom: #953800;

  pre {
    white-space: pre;
    overflow-x: auto;
  }

  &__copy.btn {
    --settings-view-api-mcp-snippet-copy-size: calc(
      var(--bs-btn-line-height) * var(--bs-btn-font-size) + var(--bs-btn-padding-y) * 2 + var(--bs-btn-border-width) * 2
    );

    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    width: var(--settings-view-api-mcp-snippet-copy-size);
    height: var(--settings-view-api-mcp-snippet-copy-size);
  }

  .tok-string {
    color: var(--settings-view-api-mcp-snippet-string);
  }

  .tok-propertyName {
    color: var(--settings-view-api-mcp-snippet-property);
  }

  .tok-atom {
    color: var(--settings-view-api-mcp-snippet-atom);
  }
}

@include color-mode(dark) {
  .settings-view-api-mcp-snippet {
    --settings-view-api-mcp-snippet-string: #a5d6ff;
    --settings-view-api-mcp-snippet-property: #79c0ff;
    --settings-view-api-mcp-snippet-atom: #ffa657;
  }
}
</style>
