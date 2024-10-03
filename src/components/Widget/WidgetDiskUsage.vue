<template>
  <v-wait for="disk usage" class="flex-grow-1" transition="fade">
    <template #waiting>
      <div class="m-5 text-center h-100">
        <phosphor-icon name="circle-notch" spin size="2em" />
      </div>
    </template>
    <widget-barometer-disk-usage v-b-modal.modal-disk-usage-details clickable class="widget widget--disk-usage" :size="size" />
  </v-wait>
  <b-modal id="modal-disk-usage-details" lazy scrollable hide-header hide-footer size="lg">
    <path-tree v-model:path="path" :projects="[project]" elasticsearch-only />
  </b-modal>
</template>

<script>
import bodybuilder from 'bodybuilder'
import { waitFor } from 'vue-wait'
import { mapState } from 'vuex'

import WidgetBarometerDiskUsage from './WidgetBarometerDiskUsage'

import PathTree from '@/components/PathTree/PathTree'

/**
 * Widget to display the disk space occupied by indexed files on the insights page.
 */
export default {
  name: 'WidgetDiskUsage',
  components: {
    PathTree,
    WidgetBarometerDiskUsage
  },
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
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
    ...mapState('insights', ['project']),
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
  mounted() {
    this.$store.subscribe(async ({ type }) => {
      if (type === 'insights/project') {
        await this.loadData()
      }
    })
  },
  methods: {
    async sumSize() {
      const index = this.$store.state.insights.project
      const body = bodybuilder()
        .andQuery('match', 'type', 'Document')
        .andQuery('match', 'extractionLevel', 0)
        .size(0)
        .aggregation('sum', 'contentLength')
        .build()
      const preference = 'widget-disk-usage'
      const res = await this.$core.api.elasticsearch.search({ index, body, preference, size: 0 })
      // eslint-disable-next-line camelcase
      return res?.aggregations?.agg_sum_contentLength?.value || 0
    },
    loadData: waitFor('disk usage', async function () {
      this.size = await this.sumSize()
    })
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
