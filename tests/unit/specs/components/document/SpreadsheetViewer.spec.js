import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import { mount, createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import SpreadsheetViewer from '@/components/document/SpreadsheetViewer'
import {createServer} from 'http-server'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

describe('SpreadsheetViewer.vue', () => {
  let httpServer = null
  beforeAll(() => {
    httpServer = createServer({root: 'tests/unit'})
    httpServer.listen(9876)
  })
  afterAll(() => {
    httpServer.close()
  })

  it('should display error when CSV file is not found', async () => {
    var wrapped = mount(SpreadsheetViewer, {localVue, propsData: {'url': 'http://localhost:9876/invalid.csv', type: 'text/csv'}})
    await wrapped.vm.getWorkbook()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.ht_master.handsontable')).toEqual(null)
    expect(wrapped.vm.$el.querySelector('.alert').textContent).toContain('404 Not Found')
  })

  it('should display error when XLSX file is not found', async () => {
    var wrapped = mount(SpreadsheetViewer, {localVue,
      propsData: {'url': 'http://localhost:9876/invalid.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}})
    await wrapped.vm.getWorkbook()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.ht_master.handsontable')).toEqual(null)
    expect(wrapped.vm.$el.querySelector('.alert').textContent).toContain('404 Not Found')
  })

  it('should display handsontable with a CSV file', async () => {
    var wrapped = mount(SpreadsheetViewer, {localVue, propsData: {'url': 'http://localhost:9876/resources/spreadsheet.csv', type: 'text/csv'}})
    await wrapped.vm.getWorkbook()
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelector('.ht_master.handsontable')).not.toEqual(null)
  })

  it('should display handsontable with a XLSX file', async () => {
    var wrapped = mount(SpreadsheetViewer, {localVue,
      propsData: {'url': 'http://localhost:9876/resources/spreadsheet.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}})
    await wrapped.vm.getWorkbook()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.ht_master.handsontable')).not.toEqual(null)
  })
})
