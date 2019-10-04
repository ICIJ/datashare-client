import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import messages from '@/lang/en'
import messagesFr from '@/lang/fr'
import router from '@/router'
import store from '@/store'
import SearchBar from '@/components/SearchBar'
import BootstrapVue from 'bootstrap-vue'
import flushPromises from 'flush-promises'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(Vuex)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('SearchBar.vue', function () {
  let wrapper

  beforeEach(() => {
    store.commit('search/reset')
    wrapper = shallowMount(SearchBar, { localVue, i18n, router, store, sync: false })
  })

  afterAll(() => store.commit('search/reset'))

  it('should display search bar', () => {
    expect(wrapper.contains('.search-bar')).toBeTruthy()
  })

  it('should display the search-settings component', async () => {
    wrapper.setProps({ settings: true })
    await flushPromises()

    expect(wrapper.find('.search-bar search-settings-stub').exists()).toBeTruthy()
  })

  it('should display the shortkeys-modal component', async () => {
    wrapper.setProps({ settings: true })
    await flushPromises()

    expect(wrapper.find('.search-bar shortkeys-modal-stub').exists()).toBeTruthy()
  })

  it('should display a search bar button in French', async () => {
    const i18n = new VueI18n({ locale: 'fr', messages: { 'fr': messagesFr } })
    wrapper = shallowMount(SearchBar, { localVue, i18n, router, store, sync: false })

    expect(wrapper.contains('.search-bar .btn')).toBeTruthy()
    expect(wrapper.find('.search-bar .btn').text()).toEqual('Rechercher')
  })

  it('should submit search', async () => {
    // wrapper.vm.query = 'foo'
    wrapper.vm.$set(wrapper.vm, 'query', 'foo')
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toEqual('foo')

    // wrapper.vm.query = 'bar'
    wrapper.vm.$set(wrapper.vm, 'query', 'bar')
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toEqual('bar')
  })

  it('should reset the from search parameter to 0', () => {
    store.commit('search/from', 12)
    wrapper.vm.submit()

    expect(store.state.search.from).toBe(0)
  })
})
