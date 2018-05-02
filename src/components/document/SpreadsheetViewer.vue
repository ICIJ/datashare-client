<template>
  <div class="spreadsheet-viewer">
    <div class="spreadsheet-viewer__header" v-if="document.active">
      Sheet
      <select class="form-control input-sm" v-model="document.active">
        <option v-for="(_, name) in document.sheets" v-bind:key="name">
          {{ name }}
        </option>
      </select>
    </div>
    <div class="spreadsheet-viewer__hot">
      <div class="spreadsheet-viewer__hot__container"></div>
    </div>
    <div class="alert" v-if="!document.active">
      <i class="fa fa fa-cog fa-spin"></i>
      Generating preview...
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
      document: {
        promise: null,
        active: null,
        sheets: {}
      }
    }
  },
  created () {
    this.type = trim(this.type.toLowerCase(), '.')
    this.data().then(workbook => {
      this.$set(this.document, 'sheets', workbook)
      this.$set(this.document, 'active', Object.keys(workbook)[0])
    })
  },
  computed: {
    active () {
      return this.document.active
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
          data: this.document.sheets[sheetname],
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
        if (!this.document.promise) {
          // Asynchronous download the XLS(X)
          if (this.type.indexOf('xls') === 0) {
            this.document.promise = this.xlsx()
            // Asynchronous download the CSV
          } else if (this.type === 'csv') {
            this.document.promise = this.csv()
          }
        }
        // Resolve the promise when the doc is loaded
        this.document.promise.then(resolve)
      })
    }
  }
}
</script>
