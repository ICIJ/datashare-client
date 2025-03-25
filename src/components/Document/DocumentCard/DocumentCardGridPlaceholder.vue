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
  <div class="document-card-grid-placeholder border p-3 d-flex gap-3">
    <div class="document-card-grid-placeholder__wrapper flex-grow-1 d-flex flex-column gap-2">
      <div class="document-card-grid-placeholder__wrapper__thumbnail">
        <app-placeholder squared />
      </div>
      <div class="document-card-grid-placeholder__wrapper__properties d-flex flex-column gap-2 h-100 w-100">
        <app-placeholder :width="random(70, 95)" />
        <div class="d-flex flex-grow-1 gap-1" v-for="i in properties" :key="i">
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
