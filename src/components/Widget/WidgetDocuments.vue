<template>
  <div class="widget widget--documents">
    <widget-barometer-documents :to="toSearch" :nb-documents="total" :nb-documents-on-disks="onDisk" />
  </div>
</template>

<script>
import WidgetBarometerDocuments from './WidgetBarometerDocuments'

/**
 * Widget to display the number of indexed files on the insights page.
 */
export default {
  name: 'WidgetDocuments',
  components: {
    WidgetBarometerDocuments
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
      total: null
    }
  },
  computed: {
    toSearch() {
      const indices = [this.project]
      const query = { 'f[extractionLevel]': 0, indices }
      return { name: 'search', query }
    }
  },
  async created() {
    await this.loadData()
  },
  methods: {
    async count(query) {
      const index = this.project
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
    async loadData() {
      this.total = await this.countTotal()
      this.onDisk = await this.countOnDisk()
    }
  }
}
</script>
