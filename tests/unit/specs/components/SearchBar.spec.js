import VueI18n from 'vue-i18n'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import messagesFr from '@/lang/fr'
import SearchBar from '@/components/SearchBar'
import flushPromises from 'flush-promises'
import { App } from '@/main'

const { localVue, store, router, i18n } = App.init(createLocalVue()).useAll()

describe('SearchBar', function () {
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

    expect(wrapper.contains('.search-bar search-settings-stub')).toBeTruthy()
  })

  it('should display the shortkeys-modal component', async () => {
    wrapper.setProps({ settings: true })
    await flushPromises()

    expect(wrapper.contains('.search-bar shortkeys-modal-stub')).toBeTruthy()
  })

  it('should display a search bar button in French', () => {
    const i18n = new VueI18n({ locale: 'fr', messages: { 'fr': messagesFr } })
    wrapper = shallowMount(SearchBar, { localVue, i18n, store, sync: false })

    expect(wrapper.contains('.search-bar .btn')).toBeTruthy()
    expect(wrapper.find('.search-bar .btn').text()).toBe('Rechercher')
  })

  it('should submit search', () => {
    wrapper.vm.$set(wrapper.vm, 'query', 'foo')
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toBe('foo')

    wrapper.vm.$set(wrapper.vm, 'query', 'bar')
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toBe('bar')
  })

  it('should reset the from search parameter to 0', () => {
    store.commit('search/from', 12)
    wrapper.vm.submit()

    expect(store.state.search.from).toBe(0)
  })
})
