<template>
  <div class="legacy-spreadsheet-viewer d-flex flex-grow-1 my-2">
    <template v-if="doc.active">
      <div class="legacy-spreadsheet-viewer__header">
        <div class="text-center mb-4">
          {{ Object.keys(doc.sheets).indexOf(doc.active) + 1 }} / {{ Object.keys(doc.sheets).length }}
        </div>
        <div
          v-for="page in Object.keys(doc.sheets).length"
          :key="page"
          @click="doc.active = Object.keys(doc.sheets)[page - 1]"
          class="mr-2 my-2 d-flex legacy-spreadsheet-viewer__header__thumbnails"
        >
          <span class="d-flex align-items-center">{{ page }}</span>
          <div
            class="small ml-1 img-thumbnail text-truncate"
            v-html="displaySheet(Object.keys(doc.sheets)[page - 1])"
          />
        </div>
      </div>
      <div class="legacy-spreadsheet-viewer__preview">
        <div class="legacy-spreadsheet-viewer__preview__header" v-if="doc.active">
          <b-form-select
            class="input-sm"
            v-model="doc.active"
            :options="Object.keys(doc.sheets)"
            @change="displaySheet"
          />
        </div>
        <div class="legacy-spreadsheet-viewer__preview__content">
          <div v-html="displaySheet(doc.active)" />
        </div>
      </div>
    </template>
    <div v-else class="alert">
      <fa icon="cog" spin />
      {{ message }}
    </div>
  </div>
</template>

<script>
import { read, utils } from 'xlsx'
import datashareSourceMixin from '@/mixins/datashareSourceMixin'

/**
 * Display a legacy preview of spreadsheet for a document, using the XLXS library.
 */
export default {
  name: 'LegacySpreadsheetViewer',
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object,
      default: () => ({})
    }
  },
  mixins: [datashareSourceMixin],
  data() {
    return {
      message: this.$t('document.generatingPreview'),
      doc: {
        active: 0,
        sheets: {}
      }
    }
  },
  mounted() {
    this.getWorkbook()
  },
  methods: {
    getWorkbook() {
      return this.xlsx()
        .then((workbook) => {
          this.doc.sheets = workbook
          this.doc.active = Object.keys(workbook)[0]
        })
        .catch((err) => {
          this.message = err.message
        })
    },
    xlsx() {
      return this.getSource(this.document, { responseType: 'arraybuffer' }).then((arrayBuffer) => {
        let arr = ''
        const data = new Uint8Array(arrayBuffer)
        for (let i = 0; i !== data.length; ++i) {
          arr += String.fromCharCode(data[i])
        }
        const workbook = read(arr, { type: 'binary' })
        const result = {}
        workbook.SheetNames.forEach(function (sheetname) {
          const roa = utils.sheet_to_html(workbook.Sheets[sheetname])
          if (roa.length > 0) result[sheetname] = roa
        })
        return result
      })
    },
    displaySheet(value) {
      return this.doc.sheets[value]
    }
  }
}
</script>

<style lang="scss">
.legacy-spreadsheet-viewer {
  position: relative;

  .legacy-spreadsheet-viewer__header {
    flex: 0 0 15%;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    overflow-x: hidden;
    overflow-y: auto;
    max-width: 15%;
  }

  .legacy-spreadsheet-viewer__preview {
    flex: 0 0 85%;
    margin-left: 15%;
    padding-left: 1em;
  }
}
</style>
