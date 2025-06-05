<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

defineProps({
  icon: {
    type: [String, Object, Array]
  },
  label: {
    type: String
  },
  thumbnail: {
    type: String
  }
})
</script>

<template>
  <div class="settings-appearance-option d-flex justify-content-between align-items-md-center gap-2 px-3">
    <span class="d-inline-flex gap-2">
      <phosphor-icon :name="icon" />
      <span class="text-nowrap">
        {{ label }}
      </span>
    </span>
    <img :src="thumbnail" class="rounded-1 img-fluid d-none d-lg-block" />
  </div>
</template>
