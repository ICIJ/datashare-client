<script setup>
import { computed } from 'vue'

const { crop, fit } = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  crop: {
    type: Boolean,
    default: false
  },
  fit: {
    type: Boolean,
    default: false
  }
})

const classList = computed(() => {
  return {
    'document-thumbnail-image--crop': crop,
    'document-thumbnail-image--fit': fit
  }
})
</script>

<template>
  <img class="document-thumbnail-image" :class="classList" :src="src" :alt="alt" />
</template>

<style lang="scss" scoped>
.document-thumbnail-image {
  display: inline-block;
  position: relative;
  margin: auto;
  opacity: 0;
  transition: opacity 300ms;
  max-height: 100%;
  max-width: 100%;

  &--crop {
    left: 50%;
    min-height: 100%;
    min-width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    object-fit: center top;
  }

  &--fit.document-thumbnail-image--crop {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    transform: translate(-50%, -50%);
  }
}
</style>