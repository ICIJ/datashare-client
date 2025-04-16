<script setup>
import { computed, ref } from 'vue'

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
    carouselEntries.value = await fetchCarouselEntries(documentPosition.value, size)
  }
}

const disabledPrevious = computed(() => firstCarouselEntry.value?.position === 0)
const disabledNext = computed(() => lastCarouselEntry.value?.position === total.value - 1)

const firstCarouselEntry = computed(() => carouselEntries.value[0])
const lastCarouselEntry = computed(() => carouselEntries.value[carouselEntries.value.length - 1])

async function previous() {
  const position = Math.max(0, firstCarouselEntry.value.position - size)
  carouselEntries.value = await fetchCarouselEntries(position, size)
}

async function next() {
  const position = Math.min(lastCarouselEntry.value.position + size, total.value - 1)
  carouselEntries.value = await fetchCarouselEntries(position, size)
}

async function searchFromPositionAndFetch(position) {
  await searchFromPosition(position)
  await fetch()
}

const position = computed({
  get: () => documentPosition.value,
  set: goToPosition
})

function previousDocument() {
  position.value = Math.max(0, position.value - 1)
}

function nextDocument() {
  position.value = Math.min(total.value - 1, position.value + 1)
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
    class="search-carousel"
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
