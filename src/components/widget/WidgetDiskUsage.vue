<template>
  <div class="widget widget--disk-usage d-flex align-items-center text-center">
    <v-wait for="disk usage" class="flex-grow-1" transition="fade">
      <fa icon="circle-notch" spin slot="waiting" size="2x" />
      <p :class="{ 'card-body': widget.card }">
        <fa icon="weight" class="widget__icon" size="2x" />
        <strong class="widget__main-figure" :title="total">
          {{ humanSize(total, false, $t('human.size')) }}
        </strong>
        <a class="widget__details" v-b-modal.modal-disk-usage-details>
          {{ $t('widget.diskUsage.details') }}
        </a>
      </p>
    </v-wait>
    <b-modal id="modal-disk-usage-details" lazy scrollable hide-header hide-footer body-class="p-0" size="lg">
      <tree-view v-model="path" :projects="[project]" count size>
        <template #above>
          <b-collapse :visible="path === dataDir">
            <div class="my-2 mx-3 alert alert-warning p-2">
              {{ $t('widget.diskUsage.warning') }}
            </div>
          </b-collapse>
        </template>
      </tree-view>
    </b-modal>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'
import { waitFor } from 'vue-wait'
import { mapState } from 'vuex'

import elasticsearch from '@/api/elasticsearch'
import TreeView from '@/components/TreeView'
import humanSize from '@/filters/humanSize'

/**
 * Widget to display the disk space occupied by indexed files on the insights page.
 */
export default {
  name: 'WidgetDiskUsage',
  components: {
    TreeView
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
      total: null
    }
  },
  async created() {
    this.$set(this, 'path', this.dataDir)
    await this.loadData()
  },
  computed: {
    ...mapState('insights', ['project']),
    dataDir() {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    }
  },
  mounted() {
    this.$store.subscribe(async ({ type }) => {
      if (type === 'insights/project') {
        await this.loadData()
      }
    })
  },
  methods: {
    async sumTotal() {
      const index = this.$store.state.insights.project
      const body = bodybuilder()
        .andQuery('match', 'type', 'Document')
        .andQuery('match', 'extractionLevel', 0)
        .size(0)
        .aggregation('sum', 'contentLength')
        .build()
      const preference = 'widget-disk-usage'
      const res = await elasticsearch.search({ index, body, preference, size: 0 })
      // eslint-disable-next-line camelcase
      return res?.aggregations?.agg_sum_contentLength?.value || 0
    },
    loadData: waitFor('disk usage', async function () {
      const total = await this.sumTotal()
      this.$set(this, 'total', total)
    }),
    humanSize
  },
  watch: {
    project() {
      this.$set(this, 'path', this.dataDir)
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
