<script setup>
import DocumentViewerPdfNavDropdownEmbed from './DocumentViewerPdfNavDropdownEmbed'
import DocumentViewerPdfNavDropdownRotationClockwise from './DocumentViewerPdfNavDropdownRotationClockwise'
import DocumentViewerPdfNavDropdownRotationCounterClockwise from './DocumentViewerPdfNavDropdownRotationCounterClockwise'
import DocumentViewerPdfNavDropdownScale from './DocumentViewerPdfNavDropdownScale'

import { SCALE_FIT } from '@/enums/documentViewerPdf'

const rotation = defineModel('rotation', { type: Number, default: 0 })
const scale = defineModel('scale', { type: [Number, String], default: SCALE_FIT })
const embed = defineModel('embed', { type: Boolean, default: false })
</script>

<template>
  <b-dropdown
    class="document-viewer-pdf-nav-dropdown"
    menu-class="document-viewer-pdf-nav-dropdown__menu"
    toggle-class="border-0"
    variant="outline-secondary"
    no-caret
    auto-close="outside"
  >
    <template #button-content>
      <slot name="button-content">
        <phosphor-icon :name="PhDotsThreeOutlineVertical" fill />
      </slot>
    </template>
    <document-viewer-pdf-nav-dropdown-rotation-clockwise v-model="rotation" />
    <document-viewer-pdf-nav-dropdown-rotation-counter-clockwise v-model="rotation" />
    <b-dropdown-divider />
    <document-viewer-pdf-nav-dropdown-scale v-model="scale" />
    <b-dropdown-divider />
    <document-viewer-pdf-nav-dropdown-embed v-model="embed" />
  </b-dropdown>
</template>

<style lang="scss">
.document-viewer-pdf-nav-dropdown {
  &__menu {
    --bs-dropdown-zindex: #{$zindex-sticky};
    --bs-dropdown-bg: var(--bs-action-bg-subtle);
    --bs-dropdown-border-color: var(--bs-action);
    --bs-dropdown-color: var(--bs-action-text-emphasis);
    --bs-dropdown-link-color: var(--bs-link-color);
    --bs-dropdown-link-hover-bg: var(--bs-action);
    --bs-dropdown-link-hover-color: var(--bs-white);
  }
}
</style>
