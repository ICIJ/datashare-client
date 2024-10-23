<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DocumentCardGrid from '@/components/Document/DocumentCard/DocumentCardGrid'

defineProps({
  entries: {
    type: Array
  },
  selectMode: {
    type: Boolean,
    default: false
  },
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail']
  }
})

const route = useRoute()
const router = useRouter()

const showDocument = computed(() => route.name === 'document')
const onHideDocument = () => router.push({ name: 'search' })
</script>

<template>
  <div class="document-entries-grid">
    <div class="document-entries-grid__header">
      <slot name="header" />
    </div>
    <div class="document-entries-grid__list row g-3 px-0">
      <div v-for="entry in entries" :key="entry.id" class="col-lg-3 col-md-4 col-sm-6">
        <document-card-grid :document="entry" :select-mode="selectMode" :properties="properties" />
      </div>
    </div>
    <app-modal v-model="showDocument" size="xl" hide-footer @hide="onHideDocument">
      <slot />
    </app-modal>
  </div>
</template>

<style lang="scss" scoped>
.document-entries-grid {
  position: relative;

  &__header {
    background: var(--bs-body-bg);
    position: sticky;
    top: 0;
    z-index: 10;
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }
}
</style>
