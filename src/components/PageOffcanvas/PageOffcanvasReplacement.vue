<script setup>
import { OFFCANVAS_PLACEMENT, offcanvasPlacementValidator } from '@/enums/placements'
import PageOffcanvas from '@/components/PageOffcanvas/PageOffcanvas'

defineProps({
  placement: {
    type: String,
    default: OFFCANVAS_PLACEMENT.START,
    validator: offcanvasPlacementValidator
  },
  active: {
    type: Boolean
  },
  bodyClass: {
    type: [String, Array, Object],
    default: 'p-0'
  },
  noHeader: {
    type: Boolean,
    default: true
  }
})

const modelValue = defineModel({ type: Boolean })
</script>

<template>
  <page-offcanvas
    v-if="active"
    v-model="modelValue"
    :placement="placement"
    :no-header="noHeader"
    :body-class="bodyClass"
  >
    <slot />
  </page-offcanvas>
  <slot v-else />
</template>
