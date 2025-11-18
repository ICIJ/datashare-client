<script setup>
import { ref, computed, onMounted } from 'vue'
import { find, join } from 'lodash'

import DocumentTranslationAlert from './DocumentTranslationAlert/DocumentTranslationAlert'

import { useCore } from '@/composables/useCore'
import { useDocumentStore } from '@/store/modules'
import DocumentContent from '@/components/Document/DocumentContent'

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  q: {
    type: String,
    default: ''
  },
  targetLanguage: {
    type: String,
    default: 'ENGLISH'
  }
})

const core = useCore()
const documentStore = useDocumentStore()
const translations = ref([])

const selectedTargetLanguage = computed(() => {
  if (hasTranslations.value && showTranslatedContent.value) {
    return props.targetLanguage
  }
  return null
})

const sourceLanguage = computed(() => {
  return translation.value.source_language
})

const detectedLanguage = computed(() => {
  return props.document.language
})

const showTranslatedContent = computed({
  get: () => documentStore.showTranslatedContent,
  set: value => documentStore.toggleTranslatedContent(value)
})

const translation = computed(() => {
  return find(translations.value, { target_language: props.targetLanguage })
})

const hasTranslations = computed(() => {
  return !!translation.value
})

async function loadAvailableTranslations() {
  const _source = join([
    'content_translated.source_language',
    'content_translated.target_language',
    'content_translated.translator'
  ])
  const { index, id, routing } = props.document
  const data = await core.api.elasticsearch.getSource({ index, id, routing, _source })
  translations.value = data.content_translated
}

onMounted(loadAvailableTranslations)
</script>

<template>
  <div class="document-translation">
    <document-content
      :document="document"
      :q="q"
      :target-language="selectedTargetLanguage"
    >
      <template
        v-if="hasTranslations"
        #before-content
      >
        <document-translation-alert
          v-model:active="showTranslatedContent"
          :source-language="sourceLanguage"
          :target-language="targetLanguage"
          :detected-language="detectedLanguage"
        />
      </template>
    </document-content>
  </div>
</template>
