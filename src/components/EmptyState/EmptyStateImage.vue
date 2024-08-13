<script setup>
import { computed } from 'vue'

import ImageMode from '@/components/ImageMode/ImageMode'
import ImageModeSource from '@/components/ImageMode/ImageModeSource'

const props = defineProps({
  image: {
    type: String,
    required: true
  },
  imageDark: {
    type: String
  },
  alt: {
    type: String
  },
  maxWidth: {
    type: String,
    default: '200px'
  }
})

const style = computed(() => {
  return {
    '--empty-state-image-max-width': props.maxWidth
  }
})
</script>

<template>
  <div class="empty-state-image" :style="style">
    <image-mode image-class="img-fluid w-100">
      <image-mode-source v-if="imageDark" :src="imageDark" color-mode="dark" />
      <image-mode-source :src="image" :alt="alt" />
    </image-mode>
  </div>
</template>

<style lang="scss" scoped>
.empty-state-image {
  max-width: var(--empty-state-image-max-width, 200px);
  margin: 0 auto;
}
</style>
