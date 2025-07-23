<script setup>
import { computed, ref, watch } from 'vue'

import DocumentCarousel from '@/components/Document/DocumentCarousel/DocumentCarousel'
import DocumentCarouselEntry from '@/components/Document/DocumentCarousel/DocumentCarouselEntry'
import { useDocument } from '@/composables/useDocument'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useSearchNav } from '@/composables/useSearchNav'
import { useSearchStore } from '@/store/modules'

const { size } = defineProps({
  size: {
    type: Number,
    default: 5
  }
})

const {
  isDocumentInPage,
  documentPosition,
  goToPosition,
  fetchCarouselEntries,
  watchSearchEntries,
  searchFromPosition
} = useSearchNav()

const { isActive, document, watchDocument } = useDocument()
const { wheneverRouteActionShortcut } = useKeyboardShortcuts()

const searchStore = useSearchStore.inject()
const total = computed(() => searchStore.total)
const carouselEntries = ref([])

async function fetch() {
  if (document.value && isDocumentInPage.value && documentPosition.value !== null) {
    carouselEntries.value = await fetchCarouselEntries(Math.max(0, documentPosition.value), size)
  }
}

const disabledPrevious = computed(() => firstCarouselEntry.value?.position === 0)
const disabledNext = computed(() => lastCarouselEntry.value?.position === total.value - 1)

const firstCarouselEntry = computed(() => carouselEntries.value[0])
const lastCarouselEntry = computed(() => carouselEntries.value[carouselEntries.value.length - 1])

async function previous() {
  const firstEntryPosition = firstCarouselEntry.value?.position ?? 0
  const position = Math.max(0, firstEntryPosition - size)
  carouselEntries.value = await fetchCarouselEntries(position, size)
}

async function next() {
  const lastEntryPosition = lastCarouselEntry.value?.position ?? 0
  const position = Math.min(lastEntryPosition + size, total.value - 1)
  carouselEntries.value = await fetchCarouselEntries(position, size)
}

async function searchFromPositionAndFetch(position) {
  await searchFromPosition(position)
  await fetch()
}

const position = ref(documentPosition.value)
watch(position, goToPosition)
watchDocument(() => (position.value = documentPosition.value))

function previousDocument() {
  position.value = Math.max(0, position.value - 1)
}

function nextDocument() {
  position.value = Math.max(0, Math.min(total.value - 1, position.value + 1))
}

wheneverRouteActionShortcut('goToPreviousDocument', previousDocument)
wheneverRouteActionShortcut('goToNextDocument', nextDocument)

watchDocument(fetch)
watchSearchEntries(fetch, { immediate: true })
</script>

<template>
  <document-carousel
    v-if="isDocumentInPage"
    v-model:position="position"
    class="search-carousel d-none d-md-flex"
    :total="total"
    :disabled-previous="disabledPrevious"
    :disabled-next="disabledNext"
    @previous="previous"
    @next="next"
  >
    <document-carousel-entry
      v-for="entry in carouselEntries"
      :key="entry.id"
      :document="entry"
      :active="isActive(entry)"
      @click.prevent="searchFromPositionAndFetch(entry.position)"
    />
  </document-carousel>
</template>

<style lang="scss" scoped>
.search-carousel {
  position: relative;
  z-index: $zindex-popover;
}
</style>
