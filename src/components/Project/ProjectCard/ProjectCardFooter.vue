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
</script>

<template>
  <div class="project-card-footer d-flex flex-lg-row flex-column gap-3 align-items-start justify-content-between">
    <slot>
      <button-icon
        :to="toProjectInsights"
        icon-left="chart-bar"
        variant="outline-tertiary"
        truncate
        class="project-card-footer__insights"
        :label="$t('projectCardFooter.insights')"
      />
      <button-icon
        :to="toProjectSearch"
        icon-left="magnifying-glass"
        variant="outline-primary"
        truncate
        class="project-card-footer__search"
        :label="$t('projectCardFooter.search')"
      />
    </slot>
  </div>
</template>

<style lang="scss">
.project-card-footer {
  &__insights,
  &__search {
    --bs-btn-font-weight: 500;
    --bs-btn-bg: var(--bs-white);
  }
}
</style>
