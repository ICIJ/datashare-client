import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import DocumentNotes from '@/components/document/DocumentNotes'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('DocumentNotes.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(DocumentNotes, { localVue, store, mocks: { $t: msg => msg } })
  })
  it('should NOT display note on document', () => {
    expect(wrapper.find('b-alert-stub').exists()).toBeFalsy()
  })

  it('should display note on document', async () => {
    wrapper.vm.$set(wrapper.vm, 'notes', [{ note: 'This is a note', variant: 'warning' }])
    await wrapper.vm.$nextTick()

    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })

  it('should display 2 notes on document', async () => {
    wrapper.vm.$set(wrapper.vm, 'notes', [{ note: 'This is a note', variant: 'warning' }, { note: 'Another note', variant: 'danger' }])
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('b-alert-stub')).toHaveLength(2)
  })

  it('should display note on document with default variant: warning', async () => {
    wrapper.vm.$set(wrapper.vm, 'notes', [{ note: 'This is a note' }])
    await wrapper.vm.$nextTick()

    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-alert-stub').attributes('variant')).toBe('warning')
  })
})
