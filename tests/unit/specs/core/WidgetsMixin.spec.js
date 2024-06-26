import WidgetEmpty from '@/store/widgets/WidgetEmpty'
import { Core } from '@/core'

describe('WidgetsMixin', () => {
  let core

  beforeEach(async () => {
    core = Core.init().useAll()
    core.clearWidgets()
    core.store.commit('insights/project', 'local-project')
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
    // GIVEN
    core.registerWidgetForProject('first-project', { name: 'biz' })
    // GUARD ASSERT
    expect(core.store.state.insights.widgets).toHaveLength(0)
    // WHEN
    core.store.commit('insights/project', 'first-project')
    // THEN
    expect(core.store.state.insights.widgets).toHaveLength(1)
  })

  it('should find one unamed widget on the current project', () => {
    // GIVEN
    core.registerWidgetForProject('a-uniq-project-a', { foo: 'bar' })
    core.store.commit('insights/project', 'a-uniq-project-a')
    core.store.commit('insights/project', 'a-uniq-project-b')
    // GUARD ASSERT
    expect(core.store.state.insights.widgets).toHaveLength(0)
    // WHEN
    core.store.commit('insights/project', 'a-uniq-project-a')
    // THEN
    expect(core.store.state.insights.widgets).toHaveLength(1)
  })

  it('should find no widgets on the current project', () => {
    core.registerWidgetForProject('an-project', { name: 'foo' })
    core.store.commit('insights/project', 'an-project')
    expect(core.store.state.insights.widgets).toHaveLength(1)
    core.store.commit('insights/project', 'another-project')
    expect(core.store.state.insights.widgets).toHaveLength(0)
    core.store.commit('insights/project', 'an-project')
    expect(core.store.state.insights.widgets).toHaveLength(1)
    core.store.commit('insights/project', 'another-project')
    expect(core.store.state.insights.widgets).toHaveLength(0)
  })

  it('should register a widget for a project only once', () => {
    core.registerWidgetForProject('a-project-with-widget-once', { name: 'foo' })
    core.store.commit('insights/project', 'a-project-with-widget-once')
    expect(core.store.state.insights.widgets).toHaveLength(1)
    core.store.commit('insights/project', 'a-project-with-widget-once')
    core.store.commit('insights/project', 'a-project-with-widget-once')
    core.store.commit('insights/project', 'a-project-with-widget-once')
    core.store.commit('insights/project', 'a-project-with-widget-once')
    core.store.commit('insights/project', 'a-project-with-widget-once')
    expect(core.store.state.insights.widgets).toHaveLength(1)
  })

  it('should replace an existing widget', () => {
    core.clearWidgets()
    core.registerWidget({ name: 'foo', order: 0 })
    let widgets = core.store.getters['insights/instantiatedWidgets']
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('foo')
    expect(widgets[0].order).toBe(0)
    core.replaceWidget('foo', { order: 10 })
    widgets = core.store.getters['insights/instantiatedWidgets']
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('foo')
    expect(widgets[0].order).toBe(10)
  })

  it('should replace an existing widget and ignore the `name` property', () => {
    core.clearWidgets()
    core.registerWidget({ name: 'foo', order: 0 })
    let widgets = core.store.getters['insights/instantiatedWidgets']
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('foo')
    core.replaceWidget('foo', { order: 10, name: 'bar' })
    widgets = core.store.getters['insights/instantiatedWidgets']
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('foo')
  })

  it('should register a widget with a custom type with a function', () => {
    core.clearWidgets()
    core.registerWidget({
      name: 'foo',
      type(WidgetEmpty) {
        return class WidgetTest extends WidgetEmpty {
          get component() {
            return {
              name: 'WidgetTest',
              template: '<div>WidgetTest</div>'
            }
          }
        }
      }
    })
    const widgets = core.store.getters['insights/instantiatedWidgets']
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('foo')
  })

  it('should register a widget with a custom type with a class', () => {
    class WidgetTest extends WidgetEmpty {
      get component() {
        return {
          name: 'WidgetTest',
          template: '<div>WidgetTest</div>'
        }
      }
    }

    core.clearWidgets()
    core.registerWidget({ name: 'foo', type: WidgetTest })
    const widgets = core.store.getters['insights/instantiatedWidgets']
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('foo')
  })

  it('should replace an existing widget only on specific project', () => {
    core.clearWidgets()
    // Initial value for ALL projects
    core.registerWidget({ name: 'bar', order: 0 })
    let widgets = core.store.getters['insights/instantiatedWidgets']
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('bar')
    expect(widgets[0].order).toBe(0)
    // Replace widget for a specific project
    core.store.commit('insights/project', 'another-project-to-replace-widget')
    core.replaceWidgetForProject('another-project-to-replace-widget', 'bar', { order: 10 })
    widgets = core.store.getters['insights/instantiatedWidgets']
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('bar')
    expect(widgets[0].order).toBe(10)
    // Restore initial value for this project
    core.store.commit('insights/project', 'another-project-with-no-widget')
    widgets = core.store.getters['insights/instantiatedWidgets']
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('bar')
    expect(widgets[0].order).toBe(0)
  })
})
