import { createLocalVue } from '@vue/test-utils'
import { Core } from '@/core'

describe('WidgetsMixin', () => {
  let core

  beforeEach(async () => {
    core = Core.init(createLocalVue()).useAll()
    core.clearWidgets()
    core.store.commit('search/index', 'local-index')
  })

  it('should find 2 widgets', () => {
    core.registerWidget({ name: 'foo' })
    core.registerWidget({ name: 'baz' })
    expect(core.store.state.insights.widgets).toHaveLength(2)
  })

  it('should have arbitrary ordered widgets', () => {
    core.registerWidget({ name: 'foo' })
    core.registerWidget({ name: 'baz' })
    const widgets = core.store.getters['insights/instantiatedWidgets']
    expect(widgets).toHaveLength(2)
    expect(widgets[0].name).toBe('foo')
    expect(widgets[1].name).toBe('baz')
  })

  it('should have ordered widgets', () => {
    core.registerWidget({ name: 'foo', order: 3 })
    core.registerWidget({ name: 'baz', order: 1 })
    core.registerWidget({ name: 'bar', order: 2 })
    const widgets = core.store.getters['insights/instantiatedWidgets']
    expect(widgets).toHaveLength(3)
    expect(widgets[0].name).toBe('baz')
    expect(widgets[1].name).toBe('bar')
    expect(widgets[2].name).toBe('foo')
  })

  it('should have no widgets after cleaning', () => {
    core.registerWidget({ name: 'foo' })
    core.registerWidget({ name: 'baz' })
    core.clearWidgets()
    expect(core.store.state.insights.widgets).toHaveLength(0)
  })

  it('should find one widget on the current project', () => {
    core.registerWidgetForProject('first-index', { name: 'biz' })
    expect(core.store.state.insights.widgets).toHaveLength(0)
    core.store.commit('search/index', 'first-index')
    expect(core.store.state.insights.widgets).toHaveLength(1)
  })

  it('should find no widgets on the current project', () => {
    core.registerPipelineForProject('first-index', { name: 'foo' })
    core.store.commit('search/index', 'first-index')
    expect(core.store.state.insights.widgets).toHaveLength(1)
    core.store.commit('search/index', 'second-index')
    expect(core.store.state.insights.widgets).toHaveLength(0)
  })
})
