<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import PageTableTdActions from '@/components/PageTable/PageTableTdActions'

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
  <page-table-td-actions class="project-row-actions">
    <div class="d-flex gap-3">
      <slot>
        <button-icon
          :to="toProjectInsights"
          icon-left="chart-bar"
          variant="outline-tertiary"
          truncate
          hide-tooltip
          class="fw-medium"
          :label="$t('projectCardFooter.insights')"
        />
        <button-icon
          :to="toProjectSearch"
          icon-left="magnifying-glass"
          variant="outline-primary"
          truncate
          hide-tooltip
          class="fw-medium"
          :label="$t('projectCardFooter.search')"
        />
      </slot>
    </div>
  </page-table-td-actions>
</template>
