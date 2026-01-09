<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'

import Hook from '@/components/Hook/Hook'
import { useBreakpoints } from '@/composables/useBreakpoints'

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

const { t } = useI18n()

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
  <td class="project-row-links">
    <hook
      name="project-row-links:before"
      :bind="{ project }"
    />
    <div class="d-flex gap-3">
      <slot>
        <button-icon
          :to="toProjectSearch"
          :icon-left="IPhMagnifyingGlass"
          variant="outline-primary"
          truncate
          :hide-label="compact"
          class="project-row-links__search"
          :label="t('projectCardFooter.search')"
        />
      </slot>
    </div>
    <hook
      name="project-row-links:after"
      :bind="{ project }"
    />
  </td>
</template>

<style lang="scss">
.project-row-links {
  &__insights,
  &__search {
    --bs-btn-font-weight: 500;
    --bs-btn-bg: var(--bs-white);
  }
}
</style>
