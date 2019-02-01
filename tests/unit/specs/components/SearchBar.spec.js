import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'
import SearchBar from '@/components/SearchBar'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Vuex)

const i18n = new VueI18n({ locale: 'en', messages })

describe('SearchBar.vue', function () {
  let wrapper

  beforeEach(() => {
    store.commit('search/clear')
    wrapper = shallowMount(SearchBar, { localVue, i18n, router, store })
  })

  afterAll(() => {
    store.commit('search/reset')
  })

  it('should display search bar', () => {
    expect(wrapper.contains('.search-bar')).toBeTruthy()
  })

  it('should display a search settings button', async () => {
    expect(wrapper.find('.search-bar .btn').text()).toEqual('Search')
  })

  it('should display a search bar button in french', () => {
    const i18n = new VueI18n({ locale: 'fr', messages })
    wrapper = shallowMount(SearchBar, { localVue, i18n, router, store })
    expect(wrapper.contains('.search-bar .btn')).toBeTruthy()
    expect(wrapper.find('.search-bar .btn').text()).toEqual('Rechercher')
  })

  it('should submmit search', async () => {
    wrapper.vm.query = 'foo'
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toEqual('foo')

    wrapper.vm.query = 'bar'
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toEqual('bar')
  })
})
