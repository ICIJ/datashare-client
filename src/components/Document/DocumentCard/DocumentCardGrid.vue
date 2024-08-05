<script setup>
import { computed, ref } from 'vue'

import DocumentCardProperties from './DocumentCardProperties'

import DocumentThumbnail from '@/components/Document/DocumentThumbnail'
import DocumentActionsGroup from '@/components/Document/DocumentActionsGroup/DocumentActionsGroup'

const props = defineProps({
  document: {
    type: Object
  },
  active: {
    type: Boolean
  },
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail']
  },
  to: {
    type: Object
  },
  target: {
    type: String,
    default: '_self'
  },
  selectMode: {
    type: Boolean
  },
  selected: {
    type: Boolean
  },
  isDownloadAllowed: {
    type: Boolean
  }
})

const emit = defineEmits(['preview', 'update:selected'])

const hover = ref(false)

const classList = computed(() => {
  return {
    'document-card-grid--active': props.active,
    'document-card-grid--select-mode': props.selectMode,
    'document-card-grid--selected': props.selected,
    'document-card-grid--hover': hover.value
  }
})

const showThumbnail = computed(() => {
  return props.properties.includes('thumbnail')
})

const showTitle = computed(() => {
  return props.properties.includes('title')
})
</script>

<template>
  <div class="document-card-grid" :class="classList" @mouseenter="hover = true" @mouseleave="hover = false">
    <div class="d-flex align-items-start justify-content-center gap-2 px-3">
      <document-thumbnail
        v-if="showThumbnail"
        :document="document"
        size="md"
        crop
        fit
        clickable
        :active="hover"
        @click="emit('preview')"
      />
      <document-actions-group
        :document="document"
        :is-download-allowed="isDownloadAllowed"
        :selected="selected"
        :select-mode="selectMode"
        name="checkbox"
        tooltip-placement="right"
        vertical
        @update:selected="$emit('update:selected', $event)"
      />
    </div>
    <div class="document-card-grid__properties">
      <router-link v-if="showTitle" class="document-card-grid__properties__title" :to="to" :target="target">
        {{ document.title }}
      </router-link>
      <document-card-properties :document="document" :properties="properties" />
    </div>
  </div>
</template>

<style lang="scss">
.document-card-grid {
  display: flex;
  flex-direction: column;
  padding: $spacer;
  gap: $spacer;
  border-radius: var(--bs-border-radius);

  &:hover,
  &--hover {
    background: var(--bs-tertiary-bg-subtle);
  }

  &--selected:not(&--active) {
    box-shadow: 0 0 0 1px var(--bs-action-text-emphasis) inset;
  }

  &--active {
    box-shadow: 0 0 0 1px var(--bs-primary) inset;
  }

  &--selected &__properties__title,
  &--active &__properties__title {
    font-weight: 700;
  }

  &__properties {
    flex: 1;

    &__title {
      display: block;
      font-weight: 500;
      margin-bottom: $spacer;
      color: inherit;
    }
  }
}
</style>
