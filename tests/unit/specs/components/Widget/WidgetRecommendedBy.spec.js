import { shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import * as widgets from '@/store/widgets'
import WidgetRecommendedBy from '@/components/Widget/WidgetRecommendedBy'

const { index, es: elasticsearch } = esConnectionHelper.build()
const getDocumentUserRecommendations = vi.fn()
const api = { elasticsearch, getDocumentUserRecommendations }

describe('WidgetRecommendedBy.vue', () => {
  let wrapper

  beforeAll(() => {
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
    const { store, plugins } = CoreSetup.init(api).useAll().useRouter()
    store.commit('insights/project', index)
    wrapper = shallowMount(WidgetRecommendedBy, {
      global: {
        plugins
      },
      props: {
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

  it('loads a page of data, including ElasticSearch document', () => {
    expect(wrapper.vm.items[0]).toEqual(
      expect.objectContaining({
        to: expect.objectContaining({ name: 'document-standalone' }),
        document: expect.objectContaining({ title: 'Bar' }),
        user: expect.objectContaining({ id: 'jdoe' })
      })
    )
  })
})
