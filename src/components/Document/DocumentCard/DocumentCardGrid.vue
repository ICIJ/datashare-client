<script setup>
import { computed, ref } from 'vue'

import DocumentCardProperties from './DocumentCardProperties'

import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'
import DocumentActionsGroup from '@/components/Document/DocumentActionsGroup/DocumentActionsGroup'
import Hook from '@/components/Hook/Hook'
import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'
import { useDocumentModal } from '@/composables/useDocument'

const selected = defineModel('selected', { type: Boolean })

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
  target: {
    type: String,
    default: '_self'
  },
  selectMode: {
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

const { show: showDocumentViewerModal } = useDocumentModal(props.document)
const hover = ref(false)

const classList = computed(() => {
  return {
    'document-card-grid--active': props.active,
    'document-card-grid--select-mode': props.selectMode,
    'document-card-grid--selected': props.selectMode && selected.value,
    'document-card-grid--hover': hover.value
  }
})

const showThumbnail = computed(() => props.properties?.includes('thumbnail'))
const showTitle = computed(() => props.properties?.includes('title'))
</script>

<template>
  <div
    class="document-card-grid border d-flex position-relative"
    :class="classList"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <hook name="document-card-grid:before" :bind="{ document }" />
    <div class="document-card-grid__wrapper d-flex flex-column gap-3 p-3 pe-0">
      <document-thumbnail
        v-if="showThumbnail"
        :document="document"
        size="md"
        crop
        clickable
        :active="hover"
        class="mx-auto above-stretched-link"
        @click="showDocumentViewerModal"
      />
      <div class="document-card-grid__wrapper__properties">
        <hook name="document-card-grid-properties:before" :bind="{ document }" />
        <router-link-document
          v-if="showTitle"
          :id="document.id"
          :index="document.index"
          :routing="document.routing"
          :name="routeName"
          :modal="modal"
          :target="target"
          class="document-card-grid__wrapper__properties__title stretched-link"
        >
          {{ document.title }}
        </router-link-document>
        <document-card-properties :document="document" :properties="properties" />
        <hook name="document-card-grid-properties:after" :bind="{ document }" />
      </div>
    </div>
    <document-actions-group
      v-model:selected="selected"
      :document="document"
      :is-download-allowed="isDownloadAllowed"
      :select-mode="selectMode"
      name="checkbox"
      class="ms-auto flex-shrink-0 p-3 above-stretched-link"
      tooltip-placement="right"
      vertical
    />
    <hook name="document-card-grid:after" :bind="{ document }" />
  </div>
</template>

<style lang="scss">
.document-card-grid {
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

  &--selected &__wrapper__properties__title,
  &--active &__wrapper__properties__title {
    font-weight: 700;
  }

  &__wrapper {
    flex: 1 1 auto;
    min-width: 0;

    &__properties {
      flex: 1 1 auto;
      min-width: 0;

      &__title {
        display: block;
        font-weight: 500;
        margin-bottom: $spacer;
        color: inherit;
        word-break: break-all;
      }
    }
  }
}
</style>
