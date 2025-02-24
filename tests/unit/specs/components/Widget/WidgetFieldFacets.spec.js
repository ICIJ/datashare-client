import { shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import * as widgets from '@/store/widgets'
import WidgetFieldFacets from '@/components/Widget/WidgetFieldFacets'

describe('WidgetFieldFacets.vue', () => {
  const { es: elasticsearch, index: project } = esConnectionHelper.build()

  let wrapper

  beforeAll(() => {
    // Mock all elasticsearch search calls using a mock
    elasticsearch.search = vi.fn().mockImplementation(() => {
      return Promise.resolve({
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
    })
  })

  beforeEach(async () => {
    const { plugins } = CoreSetup.init({ elasticsearch }).useAll().useRouterWithoutGuards()

    wrapper = shallowMount(WidgetFieldFacets, {
      global: {
        plugins
      },
      props: {
        project,
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
