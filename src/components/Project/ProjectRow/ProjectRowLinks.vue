<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const toProjectInsights = computed(() => ({
  name: 'project.view.insights',
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
</script>

<template>
  <td class="project-row-link">
    <div class="d-flex gap-3">
      <slot>
        <button-icon
          :to="toProjectInsights"
          icon-left="chart-bar"
          variant="outline-tertiary"
          truncate
          class="fw-medium"
          :label="$t('projectCardFooter.insights')"
        />
        <button-icon
          :to="toProjectSearch"
          icon-left="magnifying-glass"
          variant="outline-primary"
          truncate
          class="fw-medium"
          :label="$t('projectCardFooter.search')"
        />
      </slot>
    </div>
  </td>
</template>
