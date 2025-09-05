<script setup>
import { computed, ref } from 'vue'

import DocumentCardProperties from './DocumentCardProperties'
import DocumentCardCheckbox from './DocumentCardCheckbox'

import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'
import DocumentActionsGroup from '@/components/Document/DocumentActionsGroup/DocumentActionsGroup'
import Hook from '@/components/Hook/Hook'
import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'
import { useDocumentModal } from '@/composables/useDocument'

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
  },
  routeName: {
    type: String,
    default: 'document'
  },
  modal: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['preview', 'update:selected'])

const { show: showDocumentViewerModal } = useDocumentModal(props.document)
const hover = ref(false)

const classList = computed(() => {
  return {
    'document-card--active': props.active,
    'document-card--select-mode': props.selectMode,
    'document-card--selected': props.selectMode && props.selected,
    'document-card--hover': hover.value
  }
})

const showThumbnail = computed(() => props.properties?.includes('thumbnail'))
const showTitle = computed(() => props.properties?.includes('title'))
</script>

<template>
  <div
    class="document-card"
    :class="classList"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <hook
      name="document-card:before"
      :bind="{ document }"
    />
    <div class="d-flex flex-column align-items-center above-stretched-link">
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
        @click="showDocumentViewerModal"
      />
    </div>
    <div class="document-card__properties">
      <hook
        name="document-card-properties:before"
        :bind="{ document }"
      />
      <router-link-document
        v-if="showTitle"
        :id="document.id"
        :index="document.index"
        :routing="document.routing"
        :name="routeName"
        :modal="modal"
        :target="target"
        class="document-card__properties__title link-visitable stretched-link"
      >
        {{ document.title }}
      </router-link-document>
      <document-card-properties
        :document="document"
        :properties="properties"
      />
      <hook
        name="document-card-properties:after"
        :bind="{ document }"
      />
    </div>
    <div class="document-card__actions above-stretched-link">
      <slot name="actions">
        <document-actions-group
          tooltip-placement="right-start"
          :document="document"
          vertical
          :is-download-allowed="isDownloadAllowed"
        />
      </slot>
    </div>
    <hook
      name="document-card:after"
      :bind="{ document }"
    />
  </div>
</template>

<style lang="scss">
.document-card {
  display: flex;
  gap: $spacer-sm;
  padding: $spacer;
  background: var(--bs-body);
  border-radius: var(--bs-border-radius);
  position: relative;

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
