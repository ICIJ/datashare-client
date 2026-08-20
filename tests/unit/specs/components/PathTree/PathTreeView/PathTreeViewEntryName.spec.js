import { mount } from '@vue/test-utils'

import PathTreeViewEntryName from '@/components/PathTree/PathTreeView/PathTreeViewEntryName'
import { LAYOUTS } from '@/enums/pathTree'

describe('PathTreeViewEntryName.vue', () => {
  // Regression test for icij/datashare#2336: the row's name/value div carries
  // Bootstrap's `stretched-link` class, whose invisible ::after overlay
  // covers the entry's whole position:relative ancestor — including nested
  // rows several levels down, each contributing their own overlay. Without
  // an explicit z-index above that stack (the same `above-stretched-link`
  // utility class the checkbox already uses), a real click on the caret can
  // be swallowed by one of those overlays instead of toggling collapse —
  // observed live specifically once a row's lock button started rendering
  // (icij/datashare#2336's select+lock work), confirmed fixed by adding this
  // class here too.
  it('keeps the caret above the stretched-link overlay stack', () => {
    const wrapper = mount(PathTreeViewEntryName, {
      props: { name: 'foo', layout: LAYOUTS.TREE }
    })

    expect(wrapper.find('.path-tree-view-entry-name__caret').classes()).toContain('above-stretched-link')
  })
})
