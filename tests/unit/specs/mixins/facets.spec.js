import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import App from '@/components/App'
import facets from '@/mixins/facets'
import { EventBus } from '@/utils/event-bus'
import VueProgressBar from 'vue-progressbar'
import router from '@/router'

const localVue = createLocalVue()
localVue.use(VueProgressBar, { color: '#852308' })
localVue.use(Murmur)

describe('facets mixin', () => {
  it('should refresh the facet on "facet::search::update" event emitted', async () => {
    const selectedValuesFromStore = jest.fn()
    shallowMount(App, { localVue, router, mixins: [facets], methods: { selectedValuesFromStore }, propsData: { facet: { name: 'facet-name' } } })
    selectedValuesFromStore.mockClear()

    EventBus.$emit('facet::search::update', 'facet-name')

    expect(selectedValuesFromStore.mock.calls.length).toBe(1)
  })

  it('should emit an event "reset-facet-values" on resetFacetValues()', () => {
    const wrapper = shallowMount(App, { localVue, router, mixins: [facets] })

    wrapper.vm.resetFacetValues()

    expect(wrapper.emitted()['reset-facet-values']).toHaveLength(1)
  })
})
