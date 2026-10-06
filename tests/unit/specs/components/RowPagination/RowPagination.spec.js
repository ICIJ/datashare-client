import { shallowMount } from '@vue/test-utils'

import RowPagination from '@/components/RowPagination/RowPagination.vue'

describe('RowPagination.vue', () => {
  function mountComponent(props = {}) {
    return shallowMount(RowPagination, { props: { totalRows: 10, ...props } })
  }

  // With zero rows, TinyPagination's row-number input is merely disabled, not hidden, and still
  // shows a literal "0" next to the "of 0 ..." label - reading as "0 of 0 users". The
  // `row-pagination--empty` class hides that now-meaningless input via CSS.
  it('flags itself as empty when there are no rows, to hide the row-number input', () => {
    const wrapper = mountComponent({ totalRows: 0 })
    expect(wrapper.classes()).toContain('row-pagination--empty')
  })

  it('does not flag itself as empty when there are rows', () => {
    const wrapper = mountComponent({ totalRows: 10 })
    expect(wrapper.classes()).not.toContain('row-pagination--empty')
  })
})
