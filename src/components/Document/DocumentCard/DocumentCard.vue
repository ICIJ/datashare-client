<script setup>
import { computed, ref } from 'vue'

import DocumentCardProperties from './DocumentCardProperties'
import DocumentCardCheckbox from './DocumentCardCheckbox'

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
    default: () => ['title', 'thumbnail', 'path']
  },
  target: {
    type: String,
    default: '_self'
  },
  selectMode: {
    type: Boolean,
    default: false
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
    'document-card--active': props.active,
    'document-card--select-mode': props.selectMode,
    'document-card--selected': props.selectMode && props.selected,
    'document-card--hover': hover.value
  }
})

const showThumbnail = computed(() => {
  return props.properties.includes('thumbnail')
})

const showTitle = computed(() => {
  return props.properties.includes('title')
})

const to = computed(() => {
  return { name: 'document', params: props.document.routerParams }
})
</script>

<template>
  <div class="document-card" :class="classList" @mouseenter="hover = true" @mouseleave="hover = false">
    <div class="d-flex flex-column align-items-center">
      <document-card-checkbox
        v-if="selectMode"
        :model-value="selected"
        @update:model-value="emit('update:selected', $event)"
      />
      <document-thumbnail
        v-if="showThumbnail"
        class="document-card__thumbnail"
        :document="document"
        size="xs"
        crop
        clickable
        :active="hover"
        @click="emit('preview')"
      />
    </div>
    <div class="document-card__properties">
      <router-link v-if="showTitle" class="document-card__properties__title" :to="to" :target="target">
        {{ document.title }}
      </router-link>
      <document-card-properties :document="document" :properties="properties" />
    </div>
    <div class="document-card__actions">
      <slot name="actions">
        <document-actions-group
          tooltip-placement="right"
          :document="document"
          vertical
          :is-download-allowed="isDownloadAllowed"
        />
      </slot>
    </div>
  </div>
</template>

<style lang="scss">
.document-card {
  display: flex;
  gap: $spacer-sm;
  padding: $spacer;
  background: var(--bs-body);
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
      margin-bottom: $spacer-xs;
      color: inherit;
      word-break: break-all;
    }
  }
}
</style>
