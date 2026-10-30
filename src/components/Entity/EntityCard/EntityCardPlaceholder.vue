<script setup>
import random from 'lodash/random'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'

defineProps({
  properties: {
    type: Array,
    default: () => ['name', 'entityType', 'sourceDocument', 'model', 'project']
  },
  repeat: {
    type: Number,
    default: 1
  }
})
</script>

<template>
  <div
    v-for="i in repeat"
    :key="i"
    class="entity-card-placeholder p-3 d-flex gap-3"
  >
    <div class="entity-card-placeholder__properties d-flex flex-column gap-2 h-100 w-100">
      <app-placeholder :width="random(40, 70)" />
      <div
        v-for="j in Math.max(properties.length - 1, 0)"
        :key="j"
        class="d-flex flex-grow-1 gap-1 align-items-start"
      >
        <app-placeholder width="1em" />
        <app-placeholder :width="random(5, 20)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.entity-card-placeholder {
  background: var(--bs-body);
  border-radius: var(--bs-border-radius);

  &__properties {
    flex: 1;
  }
}
</style>
