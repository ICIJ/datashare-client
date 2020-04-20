import toLower from 'lodash/toLower'

import store from '@/store'
import { initialState } from '@/store/modules/insights'
import { WidgetEmpty, WidgetText } from '@/store/widgets'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('InsightsStore', () => {
  const project = toLower('InsightsStore')
  esConnectionHelper(project)
  const es = esConnectionHelper.es

  beforeAll(() => store.commit('insights/index', project))

  it('should define a store module', () => {
    expect(store.state.insights).not.toBeUndefined()
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
    const initialLength = store.state.insights.widgets.length
    store.commit('insights/addWidget', { name: 'test-widget' })
    expect(store.getters['insights/instantiatedWidgets'][initialLength]).toBeInstanceOf(WidgetEmpty)
  })

  it('should instantiate a widget of type WidgetText', () => {
    const widget = { name: 'test-widget', type: 'WidgetText' }
    expect(store.getters['insights/instantiateWidget'](widget)).toBeInstanceOf(WidgetText)
  })

  it('should register a new widget of type WidgetText', () => {
    const initialLength = store.state.insights.widgets.length
    store.commit('insights/addWidget', { name: 'test-widget', type: 'WidgetText' })
    expect(store.getters['insights/instantiatedWidgets'][initialLength]).toBeInstanceOf(WidgetText)
  })

  it('should create an empty project by default', () => {
    store.commit('insights/reset')
    expect(store.state.insights.index).toBe('')
    store.commit('insights/index', project)
  })

  describe('Date aggregation', () => {
    it('should aggregate date by day', async () => {
      await letData(es).have(new IndexedDocument('document_01', project)
        .withCreationDate('2018-05-01T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('document_02', project)
        .withCreationDate('2018-05-02T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('document_03', project)
        .withCreationDate('2018-05-02T10:00:00.001Z')).commit()

      const response = await store.dispatch('insights/queryFilter', { name: 'creationDate', options: { size: 1000, interval: 'day' } })

      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets).toHaveLength(2)
    })

    it('should aggregate date by month', async () => {
      await letData(es).have(new IndexedDocument('document_01', project)
        .withCreationDate('2018-04-01T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('document_02', project)
        .withCreationDate('2018-05-01T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('document_03', project)
        .withCreationDate('2018-05-02T00:00:00.001Z')).commit()

      const response = await store.dispatch('insights/queryFilter', { name: 'creationDate', options: { size: 1000, interval: 'month' } })

      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets).toHaveLength(2)
    })

    it('should aggregate date by year', async () => {
      await letData(es).have(new IndexedDocument('document_01', project)
        .withCreationDate('2017-05-01T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('document_02', project)
        .withCreationDate('2018-05-01T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('document_03', project)
        .withCreationDate('2018-05-02T00:00:00.001Z')).commit()

      const response = await store.dispatch('insights/queryFilter', { name: 'creationDate', options: { size: 1000, interval: 'year' } })

      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets).toHaveLength(2)
    })
  })
})
