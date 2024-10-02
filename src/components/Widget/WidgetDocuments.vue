<template>
  <v-wait for="barometer counters" class="flex-grow-1" transition="fade">
    <template #waiting>
      <div class="m-5 text-center h-100">
        <phosphor-icon name="circle-notch" spin size="2em" />
      </div>
    </template>
    <widget-barometer-documents
      class="widget widget--documents"
      :nb-documents="total"
      :nb-documents-on-disks="onDisk"
    />
  </v-wait>
</template>

<script>
import { waitFor } from 'vue-wait'
import { PhosphorIcon } from '@icij/murmur-next'

import WidgetBarometerDocuments from './WidgetBarometerDocuments'

/**
 * Widget to display the number of indexed files on the insights page.
 */
export default {
  name: 'WidgetFileBarometer',
  components: {
    PhosphorIcon,
    WidgetBarometerDocuments
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
      total: null
    }
  },
  computed: {
    searchOnDiskRoute() {
      const indices = [this.$store.state.insights.project]
      const query = { 'f[extractionLevel]': 0, indices }
      return { name: 'search', query }
    }
  },
  async created() {
    await this.loadData()
  },
  mounted() {
    this.$store.subscribe(async ({ type }) => {
      // The project changed
      if (type === 'insights/project') {
        await this.loadData()
      }
    })
  },
  methods: {
    async count(query) {
      const index = this.$store.state.insights.project
      const body = { track_total_hits: true, query: { query_string: { query } } }
      const preference = 'widget-file-barometer'
      const res = await this.$core.api.elasticsearch.search({ index, body, preference, size: 0 })
      return res?.hits?.total?.value || 0
    },
    countTotal() {
      const q = 'type:Document'
      return this.count(q)
    },
    countOnDisk() {
      const q = 'type:Document AND extractionLevel:0'
      return this.count(q)
    },
    loadData: waitFor('barometer counters', async function () {
      this.total = await this.countTotal()
      this.onDisk = await this.countOnDisk()
    })
  }
}
</script>
