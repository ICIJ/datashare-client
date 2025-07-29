<script setup>
import { random } from 'lodash'
import { computed } from 'vue'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'

const props = defineProps({
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail', 'contentType']
  },
  repeat: {
    type: Number,
    default: 1
  }
})

const hasThumbnail = computed(() => props.properties?.includes('thumbnail'))
</script>

<template>
  <div
    v-for="i in repeat"
    :key="i"
    class="document-card-grid-placeholder border p-3 d-flex gap-3"
  >
    <div class="document-card-grid-placeholder__wrapper flex-grow-1 d-flex flex-column gap-2">
      <div
        v-if="hasThumbnail"
        class="document-card-grid-placeholder__wrapper__thumbnail"
      >
        <app-placeholder squared />
      </div>
      <div class="document-card-grid-placeholder__wrapper__properties d-flex flex-column gap-2 h-100 w-100">
        <app-placeholder :width="random(70, 95)" />
        <div
          v-for="j in properties.length - 1"
          :key="j"
          class="d-flex flex-grow-1 gap-1 align-items-start"
        >
          <app-placeholder width="1em" />
          <app-placeholder :width="random(30, 70)" />
        </div>
      </div>
    </div>
    <div class="document-card-grid-placeholder__actions d-flex flex-column gap-2">
      <app-placeholder squared />
      <app-placeholder squared />
      <app-placeholder squared />
      <app-placeholder squared />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.document-card-grid-placeholder {
  background: var(--bs-body);
  border-radius: var(--bs-border-radius);

  &__wrapper {
    flex: 1;

    &__properties {
      &__title {
        display: block;
        margin-bottom: $spacer-xs;
      }
    }
  }

  &__actions {
    max-width: 1.75rem;
    width: 100%;
  }
}
</style>
