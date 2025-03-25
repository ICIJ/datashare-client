<script setup>
import { computed } from 'vue'
import { random } from 'lodash'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'

const { verticalActions } = defineProps({
  properties: {
    type: Number,
    default: 4
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

const actionsClassList = computed(() => {
  return {
    'document-card-placeholder__actions--vertical': verticalActions
  }
})
</script>

<template>
  <div class="document-card-placeholder p-3 d-flex gap-3" v-for="i in repeat" :key="i">
    <div class="document-card-placeholder__thumbnail flex-grow-1">
      <app-placeholder squared />
    </div>
    <div class="document-card-placeholder__properties d-flex flex-column gap-2 h-100 w-100">
      <app-placeholder :width="random(40, 70)" />
      <div v-for="i in properties" :key="i" class="d-flex flex-grow-1 gap-1">
        <app-placeholder width="1em" />
        <app-placeholder :width="random(5, 20)" />
      </div>
    </div>
    <div class="document-card-placeholder__actions" :class="actionsClassList">
      <app-placeholder width="1.5rem" height="1.5rem" :repeat="4" />
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
