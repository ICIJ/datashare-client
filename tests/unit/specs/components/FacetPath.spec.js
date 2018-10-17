import Vue from 'vue'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'

import { mount, createLocalVue } from '@vue/test-utils'

import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

import FacetPath from '@/components/FacetPath'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'
import find from 'lodash/find'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Vuex)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({locale: 'en', messages})

describe('FacetPath.vue', () => {
  esConnectionHelper()
  var es = esConnectionHelper.es
  var wrapped = null

  beforeAll(async () => {
    Vue.prototype.config = { dataDir: '/home/user/data' }
    wrapped = mount(FacetPath, {
      localVue,
      i18n,
      router,
      store,
      propsData: {
        facet: find(store.state.aggregation.facets, { name: 'path' })
      }
    })

    wrapped.vm.$store.commit('aggregation/reset')
    await wrapped.vm.root.aggregate()
  })

  it('should display an empty tree', () => {
    // Check that there is no node in the tree
    expect(wrapped.vm.$el.querySelectorAll('.tree-node').length).toEqual(0)
  })

  it('should display a not empty tree', async () => {
    await letData(es).have(new IndexedDocument('/home/user/data/folder_01/doc_01.txt').withContent('document').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('/home/user/data/folder_02/doc_02.txt').withContent('document').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('/home/user/data/folder_03/doc_03.txt').withContent('document').withContentType('text/javascript')).commit()

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.tree-node').length).toEqual(3)
  })

  it('should display the first level of the tree', async () => {
    await letData(es).have(new IndexedDocument('/home/user/data/folder_01/file_01.txt').withContent('document').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('/home/user/data/folder_02/file_02.txt').withContent('document').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('/home/user/data/folder_02/folder_03/file_03.txt').withContent('document').withContentType('text/javascript')).commit()

    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.tree-node').length).toEqual(3)
  })
})
