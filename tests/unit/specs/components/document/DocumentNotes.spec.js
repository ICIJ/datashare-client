import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import DocumentNotes from '@/components/document/DocumentNotes'

const { localVue, store, router } = App.init(createLocalVue()).useAll()

describe('DocumentNotes.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(DocumentNotes, { localVue, router, store, mocks: { $t: msg => msg } })
  })
  it('should NOT display note on document', () => {
    expect(wrapper.find('b-alert-stub').exists()).toBeFalsy()
  })

  it('should display note on document', () => {
    wrapper.vm.$set(wrapper.vm, 'notes', [{ note: 'This is a note', variant: 'warning' }])

    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })

  it('should display 2 notes on document', () => {
    wrapper.vm.$set(wrapper.vm, 'notes', [{ note: 'This is a note', variant: 'warning' }, { note: 'Another note', variant: 'danger' }])

    expect(wrapper.findAll('b-alert-stub')).toHaveLength(2)
  })

  it('should display note on document with default variant: warning', () => {
    wrapper.vm.$set(wrapper.vm, 'notes', [{ note: 'This is a note' }])

    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-alert-stub').attributes('variant')).toBe('warning')
  })
})
