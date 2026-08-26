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
})
