<template>
  <div class="legacy-spreadsheet-viewer w-100 py-3">
    <app-overlay :show="wait.waiting(loaderId)" spinner-small class="sticky-top" rounded>
      <div class="legacy-spreadsheet-viewer__header bg-tertiary-subtle p-3 rounded">
        <b-form-select
          v-model="activeSheetName"
          class="input-sm"
          :disabled="activeSheetName === null"
          :options="sheetNames"
        />
      </div>
    </app-overlay>
    <template v-if="activeSheetName">
      <div class="legacy-spreadsheet-viewer__content mt-3">
        <div class="table-responsive" v-html="activeSheetHTML" />
      </div>
    </template>
  </div>
</template>

<script>
import { read, utils } from 'xlsx'

import { useWait } from '@/composables/useWait'
import AppOverlay from '@/components/AppOverlay/AppOverlay'
import datashareSourceMixin from '@/mixins/datashareSourceMixin'

/**
 * Display a legacy preview of spreadsheet for a document, using the XLXS library.
 */
export default {
  name: 'DocumentViewerLegacySpreadsheet',
  components: {
    AppOverlay
  },
  mixins: [datashareSourceMixin],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object,
      default: () => ({})
    }
  },
  setup() {
    return { wait: useWait() }
  },
  data() {
    return {
      workbook: null,
      activeSheetName: null
    }
  },
  computed: {
    sheetNames() {
      return this.workbook?.SheetNames ?? []
    },
    sheets() {
      return this.workbook?.Sheets ?? []
    },
    activeSheet() {
      return this.sheets[this.activeSheetName] ?? null
    },
    activeSheetHTML() {
      if (this.activeSheet) {
        return utils
          .sheet_to_html(this.activeSheet, { header: '', footer: '' })
          .replace('<table>', '<table class="table">')
      }
      return null
    },
    loaderId() {
      return this.wait.loaderId
    }
  },
  async mounted() {
    await this.generateWorkbookWithLoader()
  },
  methods: {
    async generateWorkbook() {
      try {
        const data = await this.getSource(this.document, { responseType: 'arraybuffer' })
        this.workbook = await read(data, { type: 'array' })
        this.activeSheetName = this.sheetNames[0]
      } catch ({ message }) {
        this.$toast.error(message)
      }
    },
    async generateWorkbookWithLoader() {
      this.wait.start(this.loaderId)
      await this.generateWorkbook()
      this.wait.end(this.loaderId)
    }
  }
}
</script>
