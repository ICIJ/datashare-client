<script setup>
import AppDropdown from '@/components/AppDropdown/AppDropdown'

import DocumentViewerPdfDropdownEmbed from './DocumentViewerPdfDropdownEmbed'
import DocumentViewerPdfDropdownRotationClockwise from './DocumentViewerPdfDropdownRotationClockwise'
import DocumentViewerPdfDropdownRotationCounterClockwise from './DocumentViewerPdfDropdownRotationCounterClockwise'
import DocumentViewerPdfDropdownScale from './DocumentViewerPdfDropdownScale'

import { useScrollParent } from '@/composables/useScrollParent'
import { SCALE_FIT } from '@/enums/documentViewerPdf'

const rotation = defineModel('rotation', { type: Number, default: 0 })
const scale = defineModel('scale', { type: [Number, String], default: SCALE_FIT })
const embed = defineModel('embed', { type: Boolean, default: false })

const scrollParent = useScrollParent({ node: document.body })
</script>

<template>
  <app-dropdown
    :teleport-to="scrollParent"
    boundary="viewport"
  >
    <document-viewer-pdf-dropdown-rotation-clockwise v-model="rotation" />
    <document-viewer-pdf-dropdown-rotation-counter-clockwise v-model="rotation" />
    <b-dropdown-divider />
    <document-viewer-pdf-dropdown-scale v-model="scale" />
    <b-dropdown-divider />
    <document-viewer-pdf-dropdown-embed v-model="embed" />
  </app-dropdown>
</template>
