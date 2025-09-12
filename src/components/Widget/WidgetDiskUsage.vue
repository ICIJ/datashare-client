<template>
  <div class="widget widget--disk-usage">
    <widget-barometer-disk-usage
      v-b-modal.modal-disk-usage
      clickable
      :size="size"
    />
    <app-modal
      id="modal-disk-usage"
      lazy
      scrollable
      no-header
      no-footer
      size="lg"
    >
      <path-tree
        v-model:path="path"
        :projects="[project]"
        nested
        no-tree
      />
    </app-modal>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'

import WidgetBarometerDiskUsage from './WidgetBarometerDiskUsage'

import AppModal from '@/components/AppModal/AppModal'
import PathTree from '@/components/PathTree/PathTree'

/**
 * Widget to display the disk space occupied by indexed files on the insights page.
 */
export default {
  name: 'WidgetDiskUsage',
  components: {
    AppModal,
    PathTree,
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
      onDisk: null,
      path: null,
      size: null
    }
  },
  computed: {
    dataDir() {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    }
  },
  watch: {
    project() {
      this.path = this.dataDir
    }
  },
  async created() {
    this.path = this.dataDir
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
