import WidgetEmpty from '@/store/widgets/WidgetEmpty'
import { Core } from '@/core'
import { useInsightsStore } from '@/store/modules'

describe('WidgetsMixin', () => {
  let core, store

  beforeEach(async () => {
    core = Core.init().useAll()
    core.clearWidgets()
    store = useInsightsStore()
    store.setProject('local-project')
  })

  it('should find 2 widgets', () => {
    core.registerWidget({ name: 'foo' })
    core.registerWidget({ name: 'baz' })
    expect(store.widgets).toHaveLength(2)
  })

  it('should have arbitrary ordered widgets', () => {
    core.registerWidget({ name: 'foo' })
    core.registerWidget({ name: 'baz' })
    expect(store.instantiatedWidgets).toHaveLength(2)
    expect(store.instantiatedWidgets[0].name).toBe('foo')
    expect(store.instantiatedWidgets[1].name).toBe('baz')
  })

  it('should have ordered widgets', () => {
    core.registerWidget({ name: 'foo', order: 3 })
    core.registerWidget({ name: 'baz', order: 1 })
    core.registerWidget({ name: 'bar', order: 2 })
    const widgets = store.instantiatedWidgets
    expect(widgets).toHaveLength(3)
    expect(widgets[0].name).toBe('baz')
    expect(widgets[1].name).toBe('bar')
    expect(widgets[2].name).toBe('foo')
  })

  it('should have no widgets after cleaning', () => {
    core.registerWidget({ name: 'foo' })
    core.registerWidget({ name: 'baz' })
    core.clearWidgets()
    expect(store.widgets).toHaveLength(0)
  })

  it('should find one widget on the current project', () => {
    // GIVEN
    core.registerWidgetForProject('first-project', { name: 'biz' })
    // GUARD ASSERT
    expect(store.widgets).toHaveLength(0)
    // WHEN
    store.setProject('first-project')
    // THEN
    expect(store.widgets).toHaveLength(1)
  })

  it('should find one unamed widget on the current project', () => {
    // GIVEN
    core.registerWidgetForProject('a-uniq-project-a', { foo: 'bar' })
    store.insights = 'a-uniq-project-a'
    store.insights = 'a-uniq-project-b'
    // GUARD ASSERT
    expect(store.widgets).toHaveLength(0)
    // WHEN
    store.setProject('a-uniq-project-a')
    // THEN
    expect(store.widgets).toHaveLength(1)
  })

  it('should find no widgets on the current project', () => {
    core.registerWidgetForProject('an-project', { name: 'foo' })
    store.setProject('an-project')
    expect(store.widgets).toHaveLength(1)
    store.setProject('another-project')
    expect(store.widgets).toHaveLength(0)
    store.setProject('an-project')
    expect(store.widgets).toHaveLength(1)
    store.setProject('another-project')
    expect(store.widgets).toHaveLength(0)
  })

  it('should register a widget for a project only once', () => {
    core.registerWidgetForProject('a-project-with-widget-once', { name: 'foo' })
    store.setProject('a-project-with-widget-once')
    expect(store.widgets).toHaveLength(1)
    store.setProject('a-project-with-widget-once')
    store.setProject('a-project-with-widget-once')
    store.setProject('a-project-with-widget-once')
    store.setProject('a-project-with-widget-once')
    store.setProject('a-project-with-widget-once')
    expect(store.widgets).toHaveLength(1)
  })

  it('should replace an existing widget', () => {
    core.clearWidgets()
    core.registerWidget({ name: 'foo', order: 0 })
    let widgets = store.instantiatedWidgets
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('foo')
    expect(widgets[0].order).toBe(0)
    core.replaceWidget('foo', { order: 10 })
    widgets = store.instantiatedWidgets
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('foo')
    expect(widgets[0].order).toBe(10)
  })

  it('should replace an existing widget and ignore the `name` property', () => {
    core.clearWidgets()
    core.registerWidget({ name: 'foo', order: 0 })
    let widgets = store.instantiatedWidgets
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('foo')
    core.replaceWidget('foo', { order: 10, name: 'bar' })
    widgets = store.instantiatedWidgets
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
    const widgets = store.instantiatedWidgets
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
    const widgets = store.instantiatedWidgets
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('foo')
  })

  it('should replace an existing widget only on specific project', () => {
    core.clearWidgets()
    // Initial value for ALL projects
    core.registerWidget({ name: 'bar', order: 0 })
    let widgets = store.instantiatedWidgets
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('bar')
    expect(widgets[0].order).toBe(0)
    // Replace widget for a specific project
    store.setProject('another-project-to-replace-widget')
    core.replaceWidgetForProject('another-project-to-replace-widget', 'bar', { order: 10 })
    widgets = store.instantiatedWidgets
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('bar')
    expect(widgets[0].order).toBe(10)
    // Restore initial value for this project
    store.setProject('another-project-with-no-widget')
    widgets = store.instantiatedWidgets
    expect(widgets).toHaveLength(1)
    expect(widgets[0].name).toBe('bar')
    expect(widgets[0].order).toBe(0)
  })
})
