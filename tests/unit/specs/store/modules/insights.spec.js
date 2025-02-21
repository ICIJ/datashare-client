import { setActivePinia, createPinia } from 'pinia'
import uniqueId from 'lodash/uniqueId'

import { useInsightsStore } from '@/store/modules'
import widgetsDefs, { WidgetEmpty, WidgetText } from '@/store/widgets'

describe('InsightsStore', () => {
  let store
  const project = uniqueId('insights-store-')

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useInsightsStore()
    store.setProject(project)
  })

  it('should return a list of widget', () => {
    expect(store.widgets).toHaveLength(widgetsDefs.length)
  })

  it('should have a first widget with `card` and `cols` attributes', () => {
    expect(store.widgets[0]).toHaveProperty('card')
    expect(store.widgets[0]).toHaveProperty('cols')
  })

  it('should clear the list of widgets', () => {
    expect(store.widgets.length).toBeGreaterThan(0)
    store.clearWidgets()
    expect(store.widgets).toHaveLength(0)
  })

  it('should restore the state, including the list of widgets', () => {
    store.clearWidgets()
    expect(store.widgets).toHaveLength(0)
    store.reset()
    expect(store.widgets.length).toBeGreaterThan(0)
  })

  it('should register a new widget', () => {
    const initialLength = store.widgets.length
    store.addWidget({ name: 'test-widget', type: 'WidgetText' })
    expect(store.widgets).toHaveLength(initialLength + 1)
    expect(store.widgets[initialLength]).toHaveProperty('type')
  })

  it('should return a list of instantiated widgets', () => {
    expect(store.instantiatedWidgets).toBeInstanceOf(Array)
    for (const widget of store.instantiatedWidgets) {
      expect(widget).toBeInstanceOf(WidgetEmpty)
    }
  })

  it('should register a new widget with a default type', () => {
    store.addWidget({ name: 'test-widget' })
    expect(store.instantiatedWidgets.pop()).toBeInstanceOf(WidgetEmpty)
  })

  it('should instantiate a widget of type WidgetText', () => {
    const widget = { name: 'test-text-widget-instance', type: 'WidgetText' }
    expect(store.instantiateWidget(widget)).toBeInstanceOf(WidgetText)
  })

  it('should register a new widget of type WidgetText', () => {
    store.addWidget({ name: 'test-text-widget-register', type: 'WidgetText', order: 1000 })
    expect(store.instantiatedWidgets.pop()).toBeInstanceOf(WidgetText)
  })
})
