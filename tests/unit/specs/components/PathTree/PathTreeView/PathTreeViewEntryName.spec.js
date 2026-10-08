import { mount } from '@vue/test-utils'

import PathTreeViewEntryName from '@/components/PathTree/PathTreeView/PathTreeViewEntryName'
import { LAYOUTS } from '@/enums/pathTree'

describe('PathTreeViewEntryName.vue', () => {
  const NAME = 'a_very_long_document_name_that_does_not_fit.xlsx'

  const mountName = (props = {}) => mount(PathTreeViewEntryName, {
    props: { name: NAME, layout: LAYOUTS.TREE, ...props }
  })

  const findValueWithWidths = (wrapper, scrollWidth, clientWidth) => {
    const value = wrapper.find('.path-tree-view-entry-name__value')
    Object.defineProperty(value.element, 'scrollWidth', { value: scrollWidth, configurable: true })
    Object.defineProperty(value.element, 'clientWidth', { value: clientWidth, configurable: true })
    return value
  }

  it('keeps the caret above the stretched-link overlay stack', () => {
    expect(mountName().find('.path-tree-view-entry-name__caret').classes()).toContain('above-stretched-link')
  })

  it('keeps the name text above the stretched-link overlay stack', () => {
    expect(mountName().find('[data-entry-name]').classes()).toContain('above-stretched-link')
  })

  it('toggles the collapse when the name is clicked', async () => {
    const wrapper = mountName()
    await wrapper.find('[data-entry-name]').trigger('click')

    expect(wrapper.emitted('update:collapse')).toHaveLength(1)
  })

  describe('title', () => {
    it('shows the whole name on hover once it is ellipsed', async () => {
      const value = findValueWithWidths(mountName(), 300, 100)
      await value.trigger('mouseenter')

      expect(value.attributes('title')).toBe(NAME)
    })

    it('adds no title when the name fits', async () => {
      const value = findValueWithWidths(mountName(), 100, 100)
      await value.trigger('mouseenter')

      expect(value.attributes('title')).toBeUndefined()
    })
  })

  describe('spacing', () => {
    it('separates the name from the icon', () => {
      expect(mountName().find('[data-entry-name]').classes()).toContain('ms-1')
    })

    it('does not indent the name when no icon precedes it', () => {
      const wrapper = mountName({ selectMode: true, compact: true })

      expect(wrapper.find('.path-tree-view-entry-name__value__icon').exists()).toBe(false)
      expect(wrapper.find('[data-entry-name]').classes()).not.toContain('ms-1')
    })
  })
})
