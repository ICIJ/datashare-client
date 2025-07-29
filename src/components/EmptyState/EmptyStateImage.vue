<script setup>
import { computed } from 'vue'
import { ImageMode, ImageModeSource } from '@icij/murmur-next'

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
  <div
    class="empty-state-image"
    :style="style"
  >
    <image-mode image-class="img-fluid w-100">
      <slot name="source">
        <image-mode-source
          v-if="imageDark"
          :src="imageDark"
          color-mode="dark"
        />
        <image-mode-source
          :src="image"
          :alt="alt"
        />
      </slot>
    </image-mode>
  </div>
</template>

<style lang="scss" scoped>
.empty-state-image {
  max-width: var(--empty-state-image-max-width, 200px);
  margin: 0 auto;
}
</style>
