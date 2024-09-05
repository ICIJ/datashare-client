<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const active = defineModel('active', { type: Boolean })

defineProps({
  loading: {
    type: Boolean
  }
})

const toggle = () => {
  active.value = !active.value
}

const variant = computed(() => {
  return active.value ? 'action' : 'outline-tertiary'
})
</script>

<template>
  <button-icon
    class="button-toggle-filters"
    :label="$t('buttonToggleFilters.label')"
    icon-left="funnel"
    :loading="loading"
    :variant="variant"
    @click="toggle"
  />
</template>

<style lang="scss" scoped>
.button-toggle-filters.btn-outline-tertiary {
  --bs-btn-color: var(--bs-link-color);
}
</style>
