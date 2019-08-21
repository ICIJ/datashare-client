import Vuex from 'vuex'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import App from '@/pages/App'
import facets from '@/mixins/facets'
import VueProgressBar from 'vue-progressbar'
import router from '@/router'
import store from '@/store'

jest.mock('v-calendar/lib/v-calendar.min.css', () => {})

const localVue = createLocalVue()
localVue.use(VueProgressBar, { color: '#852308' })
localVue.use(Murmur)
localVue.use(Vuex)

describe('facets mixin', () => {
  let wrapper

  it('should refresh the facet on "facet::search::update" event emitted', async () => {
    const selectedValuesFromStore = jest.fn()
    wrapper = shallowMount(App, { localVue, router, mixins: [facets], methods: { selectedValuesFromStore }, propsData: { facet: { name: 'facet-name' } } })
    selectedValuesFromStore.mockClear()

    wrapper.vm.$root.$emit('facet::search::update', 'facet-name')

    expect(selectedValuesFromStore.mock.calls).toHaveLength(1)
  })

  it('should emit an event "reset-facet-values" on resetFacetValues()', () => {
    wrapper = shallowMount(App, { localVue, router, mixins: [facets] })

    wrapper.vm.resetFacetValues()

    expect(wrapper.emitted('reset-facet-values')).toHaveLength(1)
  })

  it('should refresh the route', () => {
    const wrapper = shallowMount(App, { localVue, mixins: [facets], router, store })
    jest.spyOn(router, 'push')

    wrapper.vm.refreshRoute()

    expect(router.push).toHaveBeenCalled()
  })
})
