<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhCaretDown from '~icons/ph/caret-down'
import IPhCaretUp from '~icons/ph/caret-up'

const props = defineProps({
  collapse: {
    type: Boolean
  },
  loading: {
    type: Boolean
  }
})

const { t } = useI18n()
const emit = defineEmits(['toggle'])
const icon = computed(() => (props.collapse ? IPhCaretDown : IPhCaretUp))
</script>

<template>
  <button-icon
    class="filters-panel-section-filter-title-toggler"
    variant="link"
    size="sm"
    :loading="loading"
    :icon-left="icon"
    icon-left-weight="bold"
    :label="t('filtersPanelSectionFilterTitleToggler.toggle')"
    hide-label
    hide-tooltip
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
