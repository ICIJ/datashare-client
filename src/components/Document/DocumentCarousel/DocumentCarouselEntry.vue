<script setup>
import { computed, inject } from 'vue'

import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'

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
const modal = inject('modal', undefined)

const classList = computed(() => {
  return {
    'document-carousel-entry--active': props.active
  }
})

const to = computed(() => {
  const name = 'document'
  const params = props.document.routerParams
  const query = { modal }
  return { name, params, query }
})

const size = computed(() => {
  return props.active ? 'md' : 'sm'
})

const title = computed(() => {
  return props.document.title
})
</script>

<template>
  <router-link class="document-carousel-entry" :to="to" :class="classList" @click="emit('select', document)">
    <document-thumbnail :size="size" :document="document" crop class="mb-2" />
    <div class="document-carousel-entry__title">
      {{ title }}
    </div>
  </router-link>
</template>

<style lang="scss" scoped>
.document-carousel-entry {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 130px;
  color: var(--bs-secondary-text-emphasis);
  padding-top: 15px;
  cursor: pointer;
  border-radius: $border-radius;

  &:active,
  &:focus {
    outline: 0;

    &:deep(.document-thumbnail) {
      box-shadow: $focus-ring-box-shadow;
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
    padding-top: 5px;

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
