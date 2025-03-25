<script setup>
import { random } from 'lodash'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'

defineProps({
  properties: {
    type: Number,
    default: 4
  }
})
</script>

<template>
  <div class="document-card-placeholder p-3 d-flex gap-3">
    <div class="document-card-placeholder__thumbnail flex-grow-1">
      <app-placeholder squared />
    </div>
    <div class="document-card-placeholder__properties d-flex flex-column gap-2 h-100 w-100">
      <app-placeholder :width="random(40, 70)" />
      <div class="d-flex flex-grow-1 gap-1" v-for="i in properties" :key="i">
        <app-placeholder width="1em" />
        <app-placeholder :width="random(5, 20)" />
      </div>
    </div>
    <div class="document-card-placeholder__actions d-flex flex-column gap-1">
      <app-placeholder squared />
      <app-placeholder squared />
      <app-placeholder squared />
      <app-placeholder squared />
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
    max-width: 1.75rem;
    width: 100%;
  }
}
</style>
