import { createLocalVue, shallowMount } from '@vue/test-utils'

import DocumentNotes from '@/components/document/DocumentNotes'
import { Core } from '@/core'

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()

describe('DocumentNotes.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(DocumentNotes, { i18n, localVue, store })
  })
  it('should NOT display note on document', () => {
    expect(wrapper.find('b-alert-stub').exists()).toBeFalsy()
  })

  it('should display note on document', async () => {
    await wrapper.setData({ notes: [{ note: 'This is a note', variant: 'warning' }] })
    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })

  it('should display 2 notes on document', async () => {
    await wrapper.setData({ notes: [{ note: 'This is a note', variant: 'warning' }, { note: 'Another note', variant: 'danger' }] })
    expect(wrapper.findAll('b-alert-stub')).toHaveLength(2)
  })

  it('should display note on document with default variant: warning', async () => {
    await wrapper.setData({ notes: [{ note: 'This is a note' }] })
    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-alert-stub').attributes('variant')).toBe('warning')
  })
})
