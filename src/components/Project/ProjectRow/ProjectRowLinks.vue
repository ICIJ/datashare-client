<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { useBreakpoints } from '@/composables/breakpoints'

const { breakpointDown } = useBreakpoints()

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  compactBreakpoint: {
    type: String,
    default: 'sm'
  }
})

const toProjectInsights = computed(() => ({
  name: 'project.view.overview.insights',
  params: {
    name: props.project.name
  }
}))

const toProjectSearch = computed(() => ({
  name: 'search',
  query: {
    indices: [props.project.name]
  }
}))

const compact = computed(() => {
  return breakpointDown.value[props.compactBreakpoint]
})
</script>

<template>
  <td class="project-row-actions">
    <div class="d-flex gap-3">
      <slot>
        <button-icon
          :to="toProjectInsights"
          icon-left="chart-bar"
          variant="outline-tertiary"
          truncate
          hide-label
          class="project-row-actions__insights"
          :label="$t('projectCardFooter.insights')"
        />
        <button-icon
          :to="toProjectSearch"
          icon-left="magnifying-glass"
          variant="outline-primary"
          truncate
          :hide-label="compact"
          class="project-row-actions__search"
          :label="$t('projectCardFooter.search')"
        />
      </slot>
    </div>
  </td>
</template>

<style lang="scss">
.project-row-actions {
  &__insights,
  &__search {
    --bs-btn-font-weight: 500;
    --bs-btn-bg: var(--bs-white);
  }
}
</style>
