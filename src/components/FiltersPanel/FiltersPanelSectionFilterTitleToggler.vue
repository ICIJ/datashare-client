<script setup>
import { computed } from 'vue'
import { PhCaretDown, PhCaretUp } from '@phosphor-icons/vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  collapse: {
    type: Boolean
  },
  loading: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle'])
const icon = computed(() => (props.collapse ? PhCaretDown : PhCaretUp))
</script>

<template>
  <button-icon
    class="filters-panel-section-filter-title-toggler"
    variant="link"
    size="sm"
    :loading="loading"
    :icon-left="icon"
    icon-left-weight="bold"
    label="Toggle filter"
    hide-label
    tooltip-placement="right"
    @click="emit('toggle', !collapse)"
  >
    <slot />
  </button-icon>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-title-toggler {
  display: inline-flex;
}
</style>
