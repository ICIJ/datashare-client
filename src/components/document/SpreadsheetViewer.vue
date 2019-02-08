<template>
  <div class="spreadsheet-viewer">
    <div class="spreadsheet-viewer__header" v-if="doc.active">
      {{ $t('document.sheet') }}
      <b-form-select class="form-control input-sm" v-model="doc.active"
                     :options="Object.keys(doc.sheets)" @change="displaySheet" />
    </div>
    <div class="spreadsheet-viewer__hot">
      <div v-html="content"></div>
    </div>
    <div class="alert" v-if="!doc.active">
      <font-awesome-icon icon="cog" spin />
      {{ message }}
    </div>
  </div>
</template>

<script>
import XLSX from 'xlsx'
import DatashareClient from '@/api/DatashareClient'

const ds = new DatashareClient()

export default {
  name: 'spreadsheet-viewer',
  props: ['document'],
  data () {
    return {
      message: this.$t('document.generating_preview'),
      doc: {
        active: null,
        sheets: {}
      },
      content: ''
    }
  },
  mounted () {
    this.getWorkbook()
  },
  methods: {
    getWorkbook () {
      return this.xlsx().then(workbook => {
        this.doc.sheets = workbook
        this.doc.active = Object.keys(workbook)[0]
        this.content = this.doc.sheets[this.doc.active]
      }).catch(err => {
        this.message = err.message
      })
    },
    xlsx () {
      return ds.getSource(this.document)
        .then(r => r.arrayBuffer())
        .then(arrayBuffer => {
          let arr = ''
          const data = new Uint8Array(arrayBuffer)
          for (let i = 0; i !== data.length; ++i) {
            arr += String.fromCharCode(data[i])
          }
          const workbook = XLSX.read(arr, { type: 'binary' })
          let result = {}
          workbook.SheetNames.forEach(function (sheetname) {
            const roa = XLSX.utils.sheet_to_html(workbook.Sheets[sheetname])
            if (roa.length > 0) result[sheetname] = roa
          })
          return result
        })
    },
    displaySheet (value) {
      this.content = this.doc.sheets[value]
    }
  }
}
</script>
