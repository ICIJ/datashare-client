<script setup>
import { computed } from 'vue'

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
    <img v-if="imageDark" :src="imageDark" class="empty-state-image empty-state-image__dark" aria-hidden="true" />
    <img :src="image" :alt="alt" class="empty-state-image empty-state-image__light" />
  </div>
</template>

<style lang="scss" scoped>
.empty-state-image {
  max-width: var(--empty-state-image-max-width, 200px);
  margin: 0 auto;

  &__dark {
    display: none;
  }

  &__light,
  &__dark {
    width: 100%;
    max-width: 100%;
  }
}

@include color-mode(dark) {
  .empty-state-image__dark {
    display: block;
  }

  // Hide the light image *only* when the dark image exists
  .empty-state-image__dark + .empty-state-image__light {
    display: none;
  }
}
</style>
