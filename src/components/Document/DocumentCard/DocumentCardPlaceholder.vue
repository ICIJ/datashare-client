<script setup>
import { computed } from 'vue'
import { random } from 'lodash'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'

const props = defineProps({
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail', 'contentType']
  },
  verticalActions: {
    type: Boolean,
    default: false
  },
  repeat: {
    type: Number,
    default: 1
  }
})

const hasThumbnail = computed(() => props.properties?.includes('thumbnail'))

const actionsClassList = computed(() => {
  return {
    'document-card-placeholder__actions--vertical': props.verticalActions
  }
})
</script>

<template>
  <div v-for="i in repeat" :key="i" class="document-card-placeholder p-3 d-flex gap-3">
    <div v-if="hasThumbnail" class="document-card-placeholder__thumbnail flex-grow-1">
      <app-placeholder squared />
    </div>
    <div class="document-card-placeholder__properties d-flex flex-column gap-2 h-100 w-100">
      <app-placeholder :width="random(40, 70)" />
      <div v-for="j in properties.length - 1" :key="j" class="d-flex flex-grow-1 gap-1 align-items-start">
        <app-placeholder width="1em" />
        <app-placeholder :width="random(5, 20)" />
      </div>
    </div>
    <div class="document-card-placeholder__actions" :class="actionsClassList">
      <app-placeholder width="1.75rem" height="1.75rem" :repeat="4" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.document-card-placeholder {
  background: var(--bs-body);
  border-radius: var(--bs-border-radius);

  &__thumbnail {
    max-width: 50px;
    width: 100%;
  }

  &__properties {
    flex: 1;

    &__title {
      display: block;
      margin-bottom: $spacer-xs;
    }
  }

  &__actions {
    gap: 0.25rem;
    display: flex;
    flex-direction: row;
  }

  &__actions--vertical {
    flex-direction: column;
  }
}
</style>
