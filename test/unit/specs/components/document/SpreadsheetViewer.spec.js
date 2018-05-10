import {mount} from 'vue-test-utils'
import Vue from 'vue'
import SpreadsheetViewer from '@/components/document/SpreadsheetViewer'

describe('SpreadsheetViewer.vue', () => {
  it('should display error when CSV file is not found', async () => {
    var wrapped = mount(SpreadsheetViewer, {propsData: {'url': 'invalid.csv', type: 'text/csv'}})
    await wrapped.vm.getWorkbook()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.ht_master.handsontable')).to.equal(null)
    expect(wrapped.vm.$el.querySelector('.alert').textContent).to.contain('404 Not Found')
  })

  it('should display error when XLSX file is not found', async () => {
    var wrapped = mount(SpreadsheetViewer, {propsData: {'url': 'invalid.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}})
    await wrapped.vm.getWorkbook()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.ht_master.handsontable')).to.equal(null)
    expect(wrapped.vm.$el.querySelector('.alert').textContent).to.contain('404 Not Found')
  })

  it('should display handsontable with a CSV file', async () => {
    var wrapped = mount(SpreadsheetViewer, {propsData: {'url': 'base/resources/spreadsheet.csv', type: 'text/csv'}})
    await wrapped.vm.getWorkbook()
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelector('.ht_master.handsontable')).to.not.equal(null)
  })

  it('should display handsontable with a XLSX file', async () => {
    var wrapped = mount(SpreadsheetViewer, {propsData: {'url': 'base/resources/spreadsheet.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}})
    await wrapped.vm.getWorkbook()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.ht_master.handsontable')).to.not.equal(null)
  })
})
