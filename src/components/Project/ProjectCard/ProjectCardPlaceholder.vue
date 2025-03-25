<script setup>
import { random } from 'lodash'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'

defineProps({
  repeat: {
    type: Number,
    default: 1
  }
})
</script>

<template>
  <div v-for="i in repeat" :key="i" class="project-card-placeholder border rounded p-4 d-flex gap-3">
    <div class="flex-grow-1 project-card-placeholder__thumbnail">
      <app-placeholder squared />
    </div>
    <div class="d-flex flex-column gap-4 h-100 w-100 flex-truncate">
      <div>
        <h3>
          <app-placeholder :width="random(30, 60)" />
        </h3>
        <p>
          <app-placeholder v-for="j in 2" :key="j" :cols="random(7, 9)" whitespace />
        </p>
      </div>
      <div class="d-flex flex-column gap-2">
        <app-placeholder :width="15" />
        <app-placeholder :width="10" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project-card-placeholder {
  &__thumbnail {
    max-width: 90px;
    width: 100%;
  }
}
</style>
