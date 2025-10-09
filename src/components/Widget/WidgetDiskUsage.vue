<script setup>
import { ref, watch, toRef } from 'vue'
import bodybuilder from 'bodybuilder'

import { apiInstance as api } from '@/api/apiInstance'
import { useInsightsStore } from '@/store/modules'
import WidgetBarometerDiskUsage from './WidgetBarometerDiskUsage'

defineOptions({ name: 'WidgetDiskUsage' })

defineProps({
  /**
   * The widget definition object.
   */
  widget: {
    type: Object
  }
})

const size = ref(null)
const insightsStore = useInsightsStore()

async function sumSize() {
  const index = insightsStore.project
  const body = bodybuilder()
    .size(0)
    .andQuery('match', 'type', 'Document')
    .andQuery('match', 'extractionLevel', 0)
    .aggregation('sum', 'contentLength', 'agg_sum_content_length')
    .build()
  const preference = 'widget-disk-usage'
  const res = await api.elasticsearch.search({ index, body, preference, size: 0 })

  return res?.aggregations?.agg_sum_content_length?.value || 0
}

async function loadData() {
  size.value = await sumSize()
}

watch(toRef(insightsStore, 'project'), loadData, { immediate: true })
</script>

<template>
  <router-link
    class="widget widget--disk-usage d-block"
    :to="{ name: 'project.view.overview.paths' }"
  >
    <widget-barometer-disk-usage
      clickable
      :size="size"
    />
  </router-link>
</template>

<style lang="scss" scoped>
.widget {
  min-height: 100%;

  &__main-figure {
    display: block;
    font-size: 1.8rem;
  }

  &__details {
    color: $link-color;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
