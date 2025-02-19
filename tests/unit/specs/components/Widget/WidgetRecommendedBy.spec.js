import { shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import * as widgets from '@/store/widgets'
import WidgetRecommendedBy from '@/components/Widget/WidgetRecommendedBy'

describe('WidgetRecommendedBy.vue', () => {
  const { index, es: elasticsearch } = esConnectionHelper.build()
  const getDocumentUserRecommendations = vi.fn()
  const api = { elasticsearch, getDocumentUserRecommendations }
  const user = { id: 'jdoe' }
  const bar = { id: 'bar', index }
  const foo = { id: 'foo', index }
  const recommendations = [
    { user, document: bar },
    { user, document: foo }
  ]

  let wrapper

  beforeAll(() => {
    // Mock list of recommendation
    api.getDocumentUserRecommendations.mockResolvedValue(recommendations)
    // Mock all elasticsearch search calls using a mock
    elasticsearch.search = vi.fn().mockResolvedValue({
      hits: {
        hits: [
          { _id: bar.id, _source: { title: 'Bar' }, _index: index },
          { _id: foo.id, _source: { title: 'Foo' }, _index: index }
        ]
      }
    })
  })

  beforeEach(async () => {
    const { plugins } = CoreSetup.init(api).useAll().useRouter()
    const global = { plugins }
    const widget = new widgets.WidgetRecommendedBy({ card: true })
    const props = { widget, project: index }
    wrapper = shallowMount(WidgetRecommendedBy, { global, props })
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
        document: expect.objectContaining(bar),
        user: expect.objectContaining(user)
      })
    )
  })
})
