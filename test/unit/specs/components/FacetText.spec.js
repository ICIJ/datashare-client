import 'es6-promise/auto'

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'

import find from 'lodash/find'
import elasticsearch from 'elasticsearch-browser'

import {mount, createLocalVue} from 'vue-test-utils'

import esMapping from '@/datashare_index_mappings.json'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import ContentPlaceholder from '@/components/ContentPlaceholder'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import FacetText from '@/components/FacetText'

Vue.use(VueI18n)
Vue.use(VueProgressBar, { color: '#852308' })

const i18n = new VueI18n({locale: 'en', messages})
Vue.component('content-placeholder', ContentPlaceholder)
Vue.component('font-awesome-icon', FontAwesomeIcon)

describe('FacetText.vue', () => {
  var es = new elasticsearch.Client({host: process.env.CONFIG.es_host})
  var wrapped = null
  before(async () => {
    await es.indices.create({index: process.env.CONFIG.es_index})
    await es.indices.putMapping({index: process.env.CONFIG.es_index, type: 'doc', body: esMapping})
  })
  after(async () => {
    await es.indices.delete({index: process.env.CONFIG.es_index})
  })
  beforeEach(async () => {
    await es.deleteByQuery({index: process.env.CONFIG.es_index, conflicts: 'proceed', body: {query: {match_all: {}}}})
    const localVue = createLocalVue()
    localVue.use(VueI18n)
    wrapped = mount(FacetText, {
      i18n,
      router,
      store,
      propsData: {
        facet: find(store.state.aggregation.facets, {name: 'content-type'})
      }
    })
  })

  it('should display empty list', async () => {
    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet-named-entity__items__item').length).to.equal(0)
  })
})
