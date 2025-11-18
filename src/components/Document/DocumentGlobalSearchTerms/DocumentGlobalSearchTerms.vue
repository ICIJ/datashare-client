<script setup>
import { toRef, ref, computed, watch, onBeforeMount } from 'vue'
import { get, keys, orderBy } from 'lodash'

import DocumentGlobalSearchTermsEntry from './DocumentGlobalSearchTermsEntry'

import { useCore } from '@/composables/useCore'
import { useSearchStore } from '@/store/modules'

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  targetLanguage: {
    type: String,
    default: null
  },
  noCount: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const terms = ref([])

const searchStore = useSearchStore.inject()
const core = useCore()

const queryTerms = computed(() => searchStore.retrieveContentQueryTerms)
const queryTermsWithoutNegation = computed(() => queryTerms.value.filter(({ negation }) => !negation))
const sortedTerms = computed(() => orderBy(terms.value, ['count', 'metadata', 'tags'], ['desc', 'desc', 'desc']))
const metadataFields = computed(() => [
  ...keys(props.document.source.metadata).map(m => `source.metadata.${m}`),
  'source.language',
  'source.path'
])

onBeforeMount(resetAndSearchTerms)
watch(toRef(props, 'targetLanguage'), searchTerms)

function searchTermInContent(label) {
  const { index, id, routing } = props.document
  const searchParams = [index, id, label, props.targetLanguage, routing]
  return core.api.searchDocument(...searchParams)
}

function searchTermInTags(label) {
  const needle = label.toLowerCase()
  const tags = props.document.tags.filter(t => t.toLowerCase().includes(needle))
  const count = tags.length
  return { count, tags }
}

function searchTermInMetadata(label) {
  const needle = label.toLowerCase()
  const fields = metadataFields.value
  const metadata = fields.filter(f => String(get(props.document, f)).toLowerCase().includes(needle))
  const count = metadata.length
  return { count, metadata }
}

function resetAndSearchTerms() {
  resetTerms()
  return searchTerms()
}

function resetTerms() {
  terms.value = queryTermsWithoutNegation.value.map(({ label }) => {
    return { label, count: null, loading: true }
  })
}

async function searchTerms() {
  if (props.noCount) return
  // Then load the actual values and stats for each term
  terms.value.forEach(async ({ label }, i) => {
    try {
      const { offsets, count } = await searchTermInContent(label)
      const { count: tags } = searchTermInTags(label)
      const { count: metadata } = searchTermInMetadata(label)
      terms.value[i] = { label, count, offsets, metadata, tags }
    }
    catch {
      terms.value[i] = { label, count: 0, offsets: 0, metadata: 0, tags: 0 }
    }
  })
}
</script>

<template>
  <div
    v-if="document && terms.length"
    class="document-global-search-terms-tags d-flex align-items-center"
  >
    <ul class="list-inline m-0">
      <li
        v-for="(term, index) in sortedTerms"
        :key="index"
        class="list-inline-item"
      >
        <document-global-search-terms-entry
          :term="term"
          :index="index"
          @click="emit('select', term.label)"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.document-global-search-terms-tags {
  &__item {
    & &__metadata {
      font-style: italic;
      font-weight: normal;
    }
  }
}
</style>
