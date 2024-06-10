import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentNotes from '@/components/document/DocumentNotes'

describe('DocumentNotes.vue', () => {
  let wrapper, core, api

  beforeEach(() => {
    api = { retrieveNotes: vi.fn() }
    core = CoreSetup.init(api).useAll()
    wrapper = shallowMount(DocumentNotes, { global: { plugins: core.plugins } })
  })

  it('should NOT display note on document', () => {
    expect(wrapper.find('b-alert-stub').exists()).toBeFalsy()
  })

  it('should display note on document', async () => {
    await wrapper.setData({ notes: [{ note: 'This is a note', variant: 'warning' }] })
    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })

  it('should display 2 notes on document', async () => {
    await wrapper.setData({
      notes: [
        { note: 'This is a note', variant: 'warning' },
        { note: 'Another note', variant: 'danger' }
      ]
    })
    expect(wrapper.findAll('b-alert-stub')).toHaveLength(2)
  })

  it('should display note on document with default variant: warning', async () => {
    await wrapper.setData({ notes: [{ note: 'This is a note' }] })
    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-alert-stub').attributes('variant')).toBe('warning')
  })
})
