import 'es6-promise/auto'

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { mount } from 'vue-test-utils'
import FacetPath from '@/components/FacetPath'

import esConnectionHelper from 'test/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'test/unit/es_utils'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'
import find from 'lodash/find'

const i18n = new VueI18n({locale: 'en', messages})

describe('FacetPath.vue', () => {
  esConnectionHelper()
  var es = esConnectionHelper.es
  var wrapped = null

  before(async () => {
    wrapped = mount(FacetPath, { i18n, router, store, propsData: { facet: find(store.state.aggregation.facets, { name: 'path' }) } })
  })

  it('should display an empty tree', () => {
    // Check that the facet is displayed
    expect(wrapped.vm.$el.querySelectorAll('.facet-path-tree').length).to.equal(1)
    // Chack that there is no node in the tree
    expect(wrapped.vm.$el.querySelectorAll('.tree-node').length).to.equal(0)
  })

  it('should display a not empty tree', async () => {
    await letData(es).have(new IndexedDocument('/root/doc_01.txt').withContent('document').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('/root/folder_01/doc_02.txt').withContent('document').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('/root/folder_02/folder_03/doc_03.txt').withContent('document').withContentType('text/javascript')).commit()

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    // Check that the facet is displayed
    expect(wrapped.vm.$el.querySelectorAll('.facet-path-tree').length).to.equal(1)
    // Check that there are 2 nodes in the tree
    expect(wrapped.vm.$el.querySelectorAll('.facet-path-tree .tree-node').length).to.equal(7)
    // Among the nodes, 1 is a folder
    expect(wrapped.vm.$el.querySelectorAll('.facet-path-tree .tree-node--folder').length).to.equal(4)
    // Among the nodes, 1 is a file
    expect(wrapped.vm.$el.querySelectorAll('.facet-path-tree .tree-node--file').length).to.equal(3)
  })
})
