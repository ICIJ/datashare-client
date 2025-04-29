import { mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import * as widgets from '@/store/widgets'
import WidgetNested from '@/components/Widget/WidgetNested'
import CoreSetup from '~tests/unit/CoreSetup'

describe('WidgetNested.vue', () => {
  let wrapper

  beforeAll(() => {
    const { index: project } = esConnectionHelper.build()
    const { plugins } = CoreSetup.init().useAll()

    wrapper = mount(WidgetNested, {
      global: {
        plugins
      },
      props: {
        project,
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
