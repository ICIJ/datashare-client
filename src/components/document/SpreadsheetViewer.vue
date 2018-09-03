<template>
  <div class="spreadsheet-viewer">
    <div class="spreadsheet-viewer__header" v-if="doc.active">
      Sheet
      <select class="form-control input-sm" v-model="doc.active">
        <option v-for="(_, name) in doc.sheets" v-bind:key="name">
          {{ name }}
        </option>
      </select>
    </div>
    <div class="spreadsheet-viewer__hot">
      <div class="spreadsheet-viewer__hot__container"></div>
    </div>
    <div class="alert" v-if="!doc.active">
      <font-awesome-icon icon="cog" spin />
      {{ message }}
    </div>
  </div>
</template>

<script>
import Handsontable from 'handsontable'
import XLSX from 'xlsx'
import Papa from 'papaparse'
import DatashareClient from '@/api/DatashareClient'

const ds = new DatashareClient()

export default {
  name: 'spreadsheet-viewer',
  props: ['url', 'type'],
  data () {
    return {
      message: 'Generating preview...',
      spreadsheet: null,
      doc: {
        active: null,
        sheets: {}
      }
    }
  },
  mounted () {
    this.getWorkbook()
  },
  computed: {
    active () {
      return this.doc.active
    },
    hotEl () {
      return this.$el.querySelector('.spreadsheet-viewer__hot__container')
    }
  },
  methods: {
    getWorkbook () {
      let p = null
      if (this.type.localeCompare('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') === 0) {
        p = this.xlsx()
      } else if (this.type.localeCompare('text/csv') === 0) {
        p = this.csv()
      } else {
        return null
      }
      return p.then(workbook => {
        this.doc.sheets = workbook
        this.doc.active = Object.keys(workbook)[0]
        if (this.spreadsheet) {
          this.spreadsheet.destroy()
        }
        this.spreadsheet = new Handsontable(this.hotEl, {
          data: this.doc.sheets[this.doc.active],
          minSpareCols: 1,
          minSpareRows: 1,
          contextMenu: false,
          preventOverflow: 'horizontal'
        })
      }).catch(err => {
        this.message = err.message
      })
    },
    xlsx () {
      return ds.getSource(this.url)
        .then(r => r.arrayBuffer())
        .then(arrayBuffer => {
          var data = new Uint8Array(arrayBuffer)
          var arr = []
          for (var i = 0; i !== data.length; ++i) {
            arr[i] = String.fromCharCode(data[i])
          }
          var workbook = XLSX.read(arr.join(''), {type: 'binary'})
          var result = {}
          workbook.SheetNames.forEach(function (sheetname) {
            var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetname], {header: 1})
            if (roa.length > 0) result[sheetname] = roa
          })
          return result
        })
    },
    csv () {
      return ds.getSource(this.url)
        .then(r => r.text())
        .then(csv => { return { 1: Papa.parse(csv).data } })
    }
  }
}
</script>
