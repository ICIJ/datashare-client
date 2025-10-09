import { shallowMount, flushPromises } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import * as widgets from '@/store/widgets'
import WidgetFieldFacets from '@/components/Widget/WidgetFieldFacets'
import { useInsightsStore } from '@/store/modules/insights'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      elasticsearch: {
        search: vi.fn().mockResolvedValue({
          aggregations: {
            facets: {
              buckets: [
                { key: 'foo', doc_count: 10 },
                { key: 'bar', doc_count: 20 }
              ]
            }
          },
          hits: {
            total: { value: 30 }
          }
        })
      }
    }
  }
})

describe('WidgetFieldFacets.vue', () => {
  const { index: project } = esConnectionHelper.build()

  let wrapper

  beforeEach(async () => {
    const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()
    const insightsStore = useInsightsStore()
    insightsStore.setProject(project)

    wrapper = shallowMount(WidgetFieldFacets, {
      global: {
        plugins
      },
      props: {
        widget: new widgets.WidgetFieldFacets({
          title: 'Test Widget',
          card: true,
          field: 'contentType',
          routeQueryField: 'contentType'
        })
      }
    })
    // Wait for the loading of the first page
    await flushPromises()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('has the correct class', () => {
    expect(wrapper.classes()).toContain('widget--field-facets')
  })

  it('loads a page of data', () => {
    expect(wrapper.vm.total).toBe(30)
    expect(wrapper.vm.items[0]).toEqual({ label: 'foo', count: 10, to: expect.objectContaining({ name: 'search' }) })
    expect(wrapper.vm.items[1]).toEqual({ label: 'bar', count: 20, to: expect.objectContaining({ name: 'search' }) })
  })
})
