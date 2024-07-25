<script setup>
import { computed } from 'vue'

import DocumentThumbnail from '@/components/Document/DocumentThumbnail'

const props = defineProps({
  active: {
    type: Boolean
  },
  document: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['select'])

const classList = computed(() => {
  return {
    'document-carousel-entry--active': props.active
  }
})

const thumbnailSize = computed(() => {
  return props.active ? 100 : 'sm'
})

const title = computed(() => {
  return props.document.title
})

const href = computed(() => {
  return `#${props.document.route}`
})
</script>

<template>
  <a class="document-carousel-entry" :href="href" :class="classList" @click.prevent="emit('select', document)">
    <document-thumbnail :size="thumbnailSize" :document="document" crop hide-placeholder class="mb-2" />
    <component :is="document.contentTypeIcon" size="1.25em" class="mb-2" />
    <div class="document-carousel-entry__title">
      {{ title }}
    </div>
  </a>
</template>

<style lang="scss" scoped>
.document-carousel-entry {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 130px;
  color: var(--bs-secondary-text-emphasis);
  padding-top: 10px;
  cursor: pointer;
  border-radius: $border-radius;

  &:active,
  &:focus {
    outline: 0;
    box-shadow: $focus-ring-box-shadow;

    &:deep(.document-thumbnail) {
      border-color: var(--bs-primary);
    }
  }

  &:deep(.document-thumbnail) {
    overflow: hidden;
    border-radius: $border-radius-sm;
    border: 1px solid var(--bs-border-color);
  }

  &--active {
    color: var(--bs-body-color);
    font-weight: 500;
    padding-top: 0;

    &:deep(.document-thumbnail) {
      border-color: var(--bs-primary);
    }
  }

  &__title {
    color: var(--bs-body-color);
    word-break: break-all;
    overflow: hidden;
    display: -webkit-box;
    line-clamp: 4;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }
}
</style>
