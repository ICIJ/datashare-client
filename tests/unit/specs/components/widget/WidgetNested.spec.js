import { createLocalVue, mount } from '@vue/test-utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'

import * as widgets from '@/store/widgets'
import WidgetNested from '@/components/widget/WidgetNested'
import { Core } from '@/core'

const { index: project, es: elasticsearch } = esConnectionHelper.build()
const { localVue, router, store, wait, i18n } = Core.init(createLocalVue(), { elasticsearch }).useAll()

describe('WidgetNested.vue', () => {
  let wrapper

  beforeAll(() => {
    store.commit('insights/project', project)

    wrapper = mount(WidgetNested, {
      localVue,
      router,
      store,
      wait,
      i18n,
      propsData: {
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
