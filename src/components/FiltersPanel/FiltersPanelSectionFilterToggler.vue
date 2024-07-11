<script setup>
import { computed } from 'vue'

import IconButton from '@/components/IconButton.vue'

const props = defineProps({
  collapse: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle'])
const icon = computed(() => (props.collapse ? 'caret-down' : 'caret-up'))
</script>

<template>
  <icon-button
    class="filters-panel-section-filter-toggler p-0"
    variant="link"
    size="sm"
    :icon-left="icon"
    icon-left-weight="bold"
    label="Toggle filter"
    hide-label
    tooltip-placement="right"
    @click="emit('toggle', !collapse)"
  >
    <slot />
  </icon-button>
</template>
