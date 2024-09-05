<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  active: {
    type: Boolean
  },
  loading: {
    type: Boolean
  }
})

const variant = computed(() => {
  return props.active ? 'action' : 'outline-tertiary'
})
</script>

<template>
  <button-icon
    class="button-toggle-filters"
    :label="$t('buttonToggleFilters.label')"
    icon-left="funnel"
    :loading="loading"
    :variant="variant"
  />
</template>

<style lang="scss" scoped>
.button-toggle-filters.btn-outline-tertiary {
  --bs-btn-color: var(--bs-link-color);
}
</style>
