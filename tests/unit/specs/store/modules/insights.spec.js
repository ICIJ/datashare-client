import toLower from 'lodash/toLower'

import store from '@/store'
import { initialState } from '@/store/modules/insights'
import { WidgetEmpty, WidgetText } from '@/store/widgets'

describe('InsightsStore', () => {
  const project = toLower('InsightsStore')

  beforeAll(() => store.commit('insights/project', project))

  it('should define a store module', () => {
    expect(store.state.insights).toBeDefined()
  })

  it('should return a list of widget', () => {
    expect(store.state.insights.widgets).toHaveLength(initialState().widgets.length)
  })

  it('should have a first widget with `card` and `cols` attributes', () => {
    expect(store.state.insights.widgets[0]).toHaveProperty('card')
    expect(store.state.insights.widgets[0]).toHaveProperty('cols')
  })

  it('should clear the list of widgets', () => {
    expect(store.state.insights.widgets.length).toBeGreaterThan(0)
    store.commit('insights/clearWidgets')
    expect(store.state.insights.widgets).toHaveLength(0)
  })

  it('should restore the state, including the list of widgets', () => {
    store.commit('insights/clearWidgets')
    expect(store.state.insights.widgets).toHaveLength(0)
    store.commit('insights/reset')
    expect(store.state.insights.widgets.length).toBeGreaterThan(0)
  })

  it('should register a new widget', () => {
    const initialLength = store.state.insights.widgets.length
    store.commit('insights/addWidget', { name: 'test-widget', type: 'WidgetText' })
    expect(store.state.insights.widgets).toHaveLength(initialLength + 1)
    expect(store.state.insights.widgets[initialLength]).toHaveProperty('type')
  })

  it('should return a list of instantiated widgets', () => {
    expect(store.getters['insights/instantiatedWidgets']).toBeInstanceOf(Array)
    for (const widget of store.getters['insights/instantiatedWidgets']) {
      expect(widget).toBeInstanceOf(WidgetEmpty)
    }
  })

  it('should register a new widget with a default type', () => {
    store.commit('insights/addWidget', { name: 'test-widget' })
    expect(store.getters['insights/instantiatedWidgets'].pop()).toBeInstanceOf(WidgetEmpty)
  })

  it('should instantiate a widget of type WidgetText', () => {
    const widget = { name: 'test-text-widget-instance', type: 'WidgetText' }
    expect(store.getters['insights/instantiateWidget'](widget)).toBeInstanceOf(WidgetText)
  })

  it('should register a new widget of type WidgetText', () => {
    store.commit('insights/addWidget', { name: 'test-text-widget-register', type: 'WidgetText', order: 1000 })
    expect(store.getters['insights/instantiatedWidgets'].pop()).toBeInstanceOf(WidgetText)
  })

  it('should create an empty project by default', () => {
    store.commit('insights/reset')
    expect(store.state.insights.project).toBe('')
    store.commit('insights/project', project)
  })
})
