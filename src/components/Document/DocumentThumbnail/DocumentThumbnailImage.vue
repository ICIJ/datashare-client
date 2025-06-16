<script setup>
import { computed } from 'vue'

const { src } = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  }
})

const style = computed(() => {
  return {
    backgroundImage: `url(${src})`
  }
})
</script>

<template>
  <span class="document-thumbnail-image" :style="style" />
</template>

<style lang="scss" scoped>
.document-thumbnail-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center top;
  display: block;
}
</style>
