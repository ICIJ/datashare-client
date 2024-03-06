import { createLocalVue, shallowMount } from '@vue/test-utils'
import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'

import * as widgets from '@/store/widgets'
import WidgetRecommendedBy from '@/components/widget/WidgetRecommendedBy'
import { Core } from '@/core'

const { index, es: elasticsearch } = esConnectionHelper.build()
const getDocumentUserRecommendations = vi.fn()
const api = { elasticsearch, getDocumentUserRecommendations }
const { localVue, router, store, wait, i18n } = Core.init(createLocalVue(), api).useAll()

describe('WidgetRecommendedBy.vue', () => {
  let wrapper

  beforeAll(() => {
    store.commit('insights/project', index)
    // Mock list of recommendation
    api.getDocumentUserRecommendations.mockImplementation(async () => {
      const user = { id: 'jdoe' }
      return [
        { document: { id: 'bar' }, user },
        { document: { id: 'foo' }, user }
      ]
    })
    // Mock all elasticsearch search calls using a mock
    elasticsearch.search = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        hits: {
          hits: [
            { _id: 'bar', _source: { title: 'Bar' }, _index: index },
            { _id: 'foo', _source: { title: 'Foo' }, _index: index }
          ]
        }
      })
    })
  })

  beforeEach(async () => {
    wrapper = shallowMount(WidgetRecommendedBy, {
      localVue,
      router,
      store,
      wait,
      i18n,
      propsData: {
        widget: new widgets.WidgetRecommendedBy({ card: true })
      }
    })
    // Wait for the loading of the first page
    await flushPromises()
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('has the correct class', () => {
    expect(wrapper.classes()).toContain('widget--recommended-by')
  })

  it('renders the title with card-header class when card is true', () => {
    const titleElement = wrapper.find('.widget__header')
    expect(titleElement.exists()).toBeTruthy()
    expect(titleElement.classes()).toContain('card-body')
  })

  it('renders the title without card-header class when card is false', async () => {
    await wrapper.setProps({
      widget: new widgets.WidgetRecommendedBy({ card: false })
    })

    const titleElement = wrapper.find('.widget__header')
    expect(titleElement.exists()).toBeTruthy()
    expect(titleElement.classes()).not.toContain('card-header')
  })

  it('loads a page of data, including ElasticSearch document', () => {
    expect(wrapper.vm.items[0]).toEqual(
      expect.objectContaining({
        href: expect.stringContaining(`#/ds/${index}`),
        document: expect.objectContaining({ title: 'Bar' }),
        user: expect.objectContaining({ id: 'jdoe' })
      })
    )
  })
})
