import { mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import * as widgets from '@/store/widgets'
import WidgetNested from '@/components/Widget/WidgetNested'
import { useInsightsStore } from '@/store/modules/insights'

describe('WidgetNested.vue', () => {
  let wrapper

  beforeAll(async () => {
    const { index: project } = esConnectionHelper.build()
    const { plugins } = CoreSetup.init().useAll()
    const insightsStore = useInsightsStore()
    insightsStore.setProject(project)

    wrapper = mount(WidgetNested, {
      global: {
        plugins
      },
      props: {
        widget: new widgets.WidgetNested({
          card: true,
          widgets: [
            {
              name: 'text',
              order: 50,
              card: true,
              cols: 6,
              type: 'WidgetText'
            },
            {
              name: 'empty',
              order: 5,
              card: true,
              cols: 6,
              type: 'WidgetEmpty'
            }
          ]
        })
      }
    })
    // The nested widgets' components (WidgetText, WidgetEmpty) are now
    // lazy-loaded — their chunk's on-demand transform can take real
    // wall-clock time in the test transform pipeline, so poll instead of a
    // single microtask flush.
    await vi.waitFor(() => {
      expect(wrapper.findAll('.widget__container .widget')).toHaveLength(2)
    })
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('has the correct class', () => {
    expect(wrapper.classes()).toContain('widget--nested')
  })

  it('has two nested widgets', () => {
    expect(wrapper.findAll('.widget__container .widget')).toHaveLength(2)
  })

  it('show ordered widgets', () => {
    expect(wrapper.findAll('.widget__container .widget').at(0).classes('widget--empty')).toBeTruthy()
    expect(wrapper.findAll('.widget__container .widget').at(1).classes('widget--text')).toBeTruthy()
  })
})
