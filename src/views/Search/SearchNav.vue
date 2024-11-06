<script setup>
import { matches } from 'lodash'
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

import DocumentSearchNav from '@/components/Document/DocumentSearchNav/DocumentSearchNav'
import { useDocument } from '@/composables/document'

const { document } = useDocument()
const router = useRouter()
const store = useStore()

const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  },
  page: {
    type: Number
  },
  perPage: {
    type: Number
  },
  total: {
    type: Number,
    default: 0
  }
})

// Position of the document in the entries array
const documentPageIndex = computed(() => props.entries.findIndex(matches(document.value.routerParams)))
// Position of the document in the total documents
const documentIndex = computed(() => props.perPage * (props.page - 1) + documentPageIndex.value)
// Check if there are any entries in which the document is present
const hasEntries = computed(() => documentPageIndex.value > -1)
// Check if the document is the first or last in the current page based on its position in the entries array
const isFirstInPage = computed(() => documentPageIndex.value === 0)
const isLastInPage = computed(() => documentPageIndex.value === props.perPage - 1)
// Check if the previous and next buttons should be disabled
const disabledPrevious = computed(() => documentIndex.value === 0)
const disabledNext = computed(() => documentIndex.value === props.total - 1)

const goToEntry = (entryIndex) => {
  const { routerParams: params } = props.entries[entryIndex]
  return router.push({ name: 'document', params })
}

const goToFirstEntryOfPreviousPage = async () => {
  await store.dispatch('search/previousPage')
  return goToEntry(props.entries.length - 1)
}

const goToFirstEntryOfNextPage = async () => {
  await store.dispatch('search/nextPage')
  return goToEntry(0)
}

const previous = async () => {
  if (isFirstInPage.value) {
    return goToFirstEntryOfPreviousPage()
  }
  return goToEntry(documentPageIndex.value - 1)
}

const next = () => {
  if (isLastInPage.value) {
    return goToFirstEntryOfNextPage()
  }
  return goToEntry(documentPageIndex.value + 1)
}
</script>

<template>
  <document-search-nav
    v-if="hasEntries"
    :disabled-previous="disabledPrevious"
    :disabled-next="disabledNext"
    @previous="previous"
    @next="next"
  />
</template>
