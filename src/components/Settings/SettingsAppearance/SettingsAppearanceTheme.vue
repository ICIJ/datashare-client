<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { computed } from 'vue'

import ImageMode from '@/components/ImageMode/ImageMode'
import ImageModeSource from '@/components/ImageMode/ImageModeSource'
const props = defineProps({
  icon: { type: String },
  label: { type: String },
  thumbnail: { type: String },
  active: { type: Boolean },
  height: { type: String, default: '95px' }
})
const imageClassList = computed(() => {
  return {
    'rounded-1 img-fluid': true,
    'shadow-sm ': props.active
  }
})
</script>

<template>
  <div
    class="settings-appearance-theme d-flex flex-grow-1 justify-content-between align-items-center gap-2 px-3"
    style="height: 95px"
  >
    <span class="d-flex gap-2">
      <phosphor-icon :name="icon" />
      <span class="text-nowrap">{{ label }}</span></span
    >
    <image-mode :image-class="imageClassList">
      <image-mode-source :src="thumbnail" />
    </image-mode>
  </div>
</template>

<style scoped lang="scss"></style>
