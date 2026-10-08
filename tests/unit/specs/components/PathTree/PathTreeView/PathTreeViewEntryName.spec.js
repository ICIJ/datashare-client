import { mount } from '@vue/test-utils'

import PathTreeViewEntryName from '@/components/PathTree/PathTreeView/PathTreeViewEntryName'
import { LAYOUTS } from '@/enums/pathTree'

describe('PathTreeViewEntryName.vue', () => {
  it('keeps the caret above the stretched-link overlay stack', () => {
    const wrapper = mount(PathTreeViewEntryName, {
      props: { name: 'foo', layout: LAYOUTS.TREE }
    })

    expect(wrapper.find('.path-tree-view-entry-name__caret').classes()).toContain('above-stretched-link')
  })

  // Set on every entry rather than only on the ellipsed ones: telling them
  // apart costs a layout measurement on hover, and the browser shows the
  // tooltip the same way either way.
  it('carries the whole name as a title, so an ellipsed one can still be read', () => {
    const name = 'a_very_long_document_name_that_does_not_fit.xlsx'
    const wrapper = mount(PathTreeViewEntryName, { props: { name, layout: LAYOUTS.TREE } })

    expect(wrapper.find('.path-tree-view-entry-name__value').attributes('title')).toBe(name)
  })

  describe('selectable name', () => {
    const mountName = () => mount(PathTreeViewEntryName, { props: { name: 'foo', layout: LAYOUTS.TREE } })
    const findLabel = wrapper => wrapper.find('.path-tree-view-entry-name__value__label')

    it('keeps the name text above the stretched-link overlay stack', () => {
      expect(findLabel(mountName()).classes()).toContain('above-stretched-link')
    })

    it('toggles the collapse when the name is clicked without a selection', async () => {
      const wrapper = mountName()
      await findLabel(wrapper).trigger('click')

      expect(wrapper.emitted('update:collapse')).toHaveLength(1)
    })

    it('does not toggle the collapse when the click ends a selection of the name', async () => {
      const wrapper = mountName()
      const label = findLabel(wrapper)
      const getSelection = vi
        .spyOn(window, 'getSelection')
        .mockReturnValue({ isCollapsed: false, anchorNode: label.element })

      await label.trigger('click')

      expect(wrapper.emitted('update:collapse')).toBeUndefined()
      getSelection.mockRestore()
    })

    it('toggles the collapse when the selection is outside the name', async () => {
      const wrapper = mountName()
      const getSelection = vi
        .spyOn(window, 'getSelection')
        .mockReturnValue({ isCollapsed: false, anchorNode: document.body })

      await findLabel(wrapper).trigger('click')

      expect(wrapper.emitted('update:collapse')).toHaveLength(1)
      getSelection.mockRestore()
    })
  })
})
