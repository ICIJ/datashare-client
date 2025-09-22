<script>
import bodybuilder from 'bodybuilder'

import WidgetBarometerDiskUsage from './WidgetBarometerDiskUsage'

/**
 * Widget to display the disk space occupied by indexed files on the insights page.
 */
export default {
  name: 'WidgetDiskUsage',
  components: {
    WidgetBarometerDiskUsage
  },
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
    },
    /**
     * The project name.
     */
    project: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      size: null
    }
  },
  async created() {
    await this.loadData()
  },
  methods: {
    async sumSize() {
      const index = this.project
      const body = bodybuilder()
        .andQuery('match', 'type', 'Document')
        .andQuery('match', 'extractionLevel', 0)
        .size(0)
        .aggregation('sum', 'contentLength')
        .build()
      const preference = 'widget-disk-usage'
      const res = await this.$core.api.elasticsearch.search({ index, body, preference, size: 0 })

      return res?.aggregations?.agg_sum_contentLength?.value || 0
    },
    async loadData() {
      this.size = await this.sumSize()
    }
  }
}
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
