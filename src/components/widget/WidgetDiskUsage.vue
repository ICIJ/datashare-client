<template>
  <div class="widget widget--disk-usage d-flex align-items-center text-center">
    <v-wait for="disk usage" class="flex-grow-1" transition="fade">
      <template #waiting>
        <fa icon="circle-notch" spin size="2x" class="m-3" />
      </template>
      <p :class="{ 'card-body': widget.card }">
        <fa icon="weight-scale" class="widget__icon" size="2x" />
        <strong class="widget__main-figure" :title="total">
          {{ humanSize(total, false, $t('human.size')) }}
        </strong>
        <a v-b-modal.modal-disk-usage-details class="widget__details">
          {{ $t('widget.diskUsage.details') }}
        </a>
      </p>
    </v-wait>
    <b-modal id="modal-disk-usage-details" lazy scrollable hide-header hide-footer body-class="p-0" size="lg">
      <tree-view v-model:path="path" :projects="[project]" :query="query" count size searchable>
        <template #above>
          <div class="mx-3 mb-1">
            <b-form-input
              v-model="query"
              autofocus
              :placeholder="$t('widget.diskUsage.queryPlaceholder')"
              type="search"
              class="form-control widget__directory-filter"
            />
          </div>
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
      total: null,
      query: null
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
    async sumTotal() {
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
      this.total = await this.sumTotal()
    }),
    humanSize
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
