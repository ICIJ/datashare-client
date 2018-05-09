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
      <i class="fa fa fa-cog fa-spin"></i>
      {{ info }}
    </div>
  </div>
</template>

<script>
import trim from 'lodash/trim'
import Vue from 'vue'
import 'whatwg-fetch'
import Handsontable from 'handsontable'
import XLSX from 'xlsx'
import Papa from 'papaparse'

export default {
  name: 'spreadsheet-viewer',
  props: ['url', 'type'],
  data () {
    return {
      message: 'Generating preview...',
      doc: {
        promise: null,
        active: null,
        sheets: {}
      }
    }
  },
  created () {
    this.type = trim(this.type.toLowerCase(), '.')
    this.data().then(workbook => {
      this.$set(this.doc, 'sheets', workbook)
      this.$set(this.doc, 'active', Object.keys(workbook)[0])
    })
  },
  computed: {
    active () {
      return this.doc.active
    },
    hotEl () {
      return this.$el.querySelector('.spreadsheet-viewer__hot__container')
    }
  },
  watch: {
    active (sheetname) {
      Vue.nextTick(() => {
        if (this.hot) {
          this.hot.destroy()
        }
        this.hot = new Handsontable(this.hotEl, {
          data: this.doc.sheets[sheetname],
          minSpareCols: 1,
          minSpareRows: 1,
          contextMenu: false,
          preventOverflow: 'horizontal'
        })
      })
    }
  },
  methods: {
    getArrayBuffer (url) {
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest()
        // Open the file using the prop's url
        xhr.open('GET', url, true)
        xhr.responseType = 'arraybuffer'
        // Bind onload on the XHR objct
        xhr.onload = function (e) {
          if (this.status === 200) {
            resolve(xhr.response)
          } else {
            reject(new Error('bad response status : ' + this.status))
          }
        }
        xhr.send()
      })
    },
    xlsx () {
      return this.getArrayBuffer(this.url).then(arraybuffer => {
        var data = new Uint8Array(arraybuffer)
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
      return fetch(this.url).then(csv => {
        return {1: Papa.parse(csv).data}
      })
    },
    data () {
      return new Promise((resolve, reject) => {
        if (!this.doc.promise) {
          if (this.type.localeCompare('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') === 0) {
            this.doc.promise = this.xlsx()
          } else if (this.type.localeCompare('text/csv') === 0) {
            this.doc.promise = this.csv()
          }
        }
        this.doc.promise.then(resolve).catch((err) => { this.info = err })
      })
    }
  }
}
</script>
