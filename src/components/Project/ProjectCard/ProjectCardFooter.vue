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
  <div class="project-card-footer d-flex justify-content-between">
    <button-icon
      :to="toProjectInsights"
      icon-left="chart-bar"
      variant="outline-tertiary"
      :label="$t('projectCardFooter.insights')"
    />
    <button-icon
      :to="toProjectSearch"
      icon-left="magnifying-glass"
      variant="outline-primary"
      :label="$t('projectCardFooter.search')"
    />
  </div>
</template>
