<script setup>
import { useStore } from 'vuex'
import { computed, ref } from 'vue'

import DocumentCarousel from '@/components/Document/DocumentCarousel/DocumentCarousel'
import DocumentCarouselEntry from '@/components/Document/DocumentCarousel/DocumentCarouselEntry'
import { useDocument } from '@/composables/document'
import { useSearchNav } from '@/composables/search-nav'

const { size } = defineProps({
  size: {
    type: Number,
    default: 5
  }
})

const {
  hasEntries,
  documentPosition,
  goToPosition,
  fetchCarouselEntries,
  watchSearchEntries,
  watchPosition,
  searchFromPosition
} = useSearchNav()

const { isActive, document, watchDocument } = useDocument()

const store = useStore()
const total = computed(() => store.getters['search/total'])
const carouselEntries = ref([])
const backward = ref(false)

const fetch = async () => {
  if (document.value && hasEntries.value && documentPosition.value !== null) {
    carouselEntries.value = await fetchCarouselEntries(documentPosition.value, size)
  }
}
const disabledPrevious = computed(() => firstCarouselEntry.value?.position === 0)

const disabledNext = computed(() => lastCarouselEntry.value?.position === total.value - 1)

const firstCarouselEntry = computed(() => {
  return carouselEntries.value[0]
})

const lastCarouselEntry = computed(() => {
  return carouselEntries.value[carouselEntries.value.length - 1]
})

const previous = async () => {
  const position = Math.max(0, firstCarouselEntry.value.position - size)
  carouselEntries.value = await fetchCarouselEntries(position, size)
}

const next = async () => {
  const position = Math.min(lastCarouselEntry.value.position + size, total.value - 1)
  carouselEntries.value = await fetchCarouselEntries(position, size)
}

const searchFromPositionAndFetch = async (position) => {
  await searchFromPosition(position)
  await fetch()
}

const position = computed({
  get() {
    return documentPosition.value
  },
  set: goToPosition
})

watchPosition((newPosition, oldPosition) => (backward.value = newPosition < oldPosition))
watchDocument(fetch)
watchSearchEntries(fetch, { immediate: true })
</script>

<template>
  <document-carousel
    v-if="hasEntries"
    v-model:position="position"
    class="search-carousel"
    :total="total"
    :backward="backward"
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
