import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import WidgetTreeMap from '@/components/WidgetTreeMap'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('WidgetTreeMap.vue', () => {
  beforeEach(() => {
    store.commit('insights/reset')
    document.body.innerHTML = '<div id="widget_tree_map"></div>'
  })

  it('should be a Vue instance', () => {
    const propsData = { widget: {} }
    const wrapper = shallowMount(WidgetTreeMap, { localVue, store, propsData, data () { return { id: 'widget_tree_map' } } })
    expect(wrapper).toBeTruthy()
  })

  it('should have a "widget--tree-map" class', () => {
    const propsData = { widget: {} }
    const wrapper = shallowMount(WidgetTreeMap, { localVue, store, propsData, data () { return { id: 'widget_tree_map' } } })
    expect(wrapper.attributes('class')).toContain('widget--tree-map')
  })

  it('should contain a "hello world" title', () => {
    const propsData = { widget: { title: 'Hello world' } }
    const wrapper = shallowMount(WidgetTreeMap, { localVue, store, propsData, data () { return { id: 'widget_tree_map' } } })
    expect(wrapper.find('.widget__header').text()).toBe('Hello world')
  })

  it('should display children names in the tree map', () => {
    const propsData = { widget: { data: { children: [{ dirname: 'AABOL', doc_count: 26 }] } } }
    shallowMount(WidgetTreeMap, { localVue, store, propsData, data () { return { id: 'widget_tree_map' } } })
    expect(document.getElementsByTagName('text')[0].innerHTML).toBe('AABOL')
  })
})
