import { shallowMount, flushPromises } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import * as widgets from '@/store/widgets'
import WidgetRecommendedBy from '@/components/Widget/WidgetRecommendedBy'
import { apiInstance as api } from '@/api/apiInstance'
import { useInsightsStore } from '@/store/modules/insights'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const {
    apiInstance: { elasticsearch }
  } = await importOriginal()

  return {
    apiInstance: {
      elasticsearch,
      getDocumentUserRecommendations: vi.fn()
    }
  }
})

describe('WidgetRecommendedBy.vue', () => {
  const { index } = esConnectionHelper.build()
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
    api.elasticsearch.search = vi.fn().mockResolvedValue({
      hits: {
        hits: [
          { _id: bar.id, _source: { title: 'Bar' }, _index: index },
          { _id: foo.id, _source: { title: 'Foo' }, _index: index }
        ]
      }
    })
  })

  beforeEach(async () => {
    const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()
    const insightsStore = useInsightsStore()
    const global = { plugins }
    const widget = new widgets.WidgetRecommendedBy({ card: true })
    const props = { widget }
    insightsStore.setProject(index)
    wrapper = shallowMount(WidgetRecommendedBy, { global, props })
    await flushPromises()
  })

  afterAll(() => {
    vi.resetAllMocks()
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
        document: expect.objectContaining(bar),
        user: expect.objectContaining(user)
      })
    )
  })
})
