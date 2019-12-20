import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import DocumentAlert from '@/components/document/DocumentAlert'

const { localVue, store, router } = App.init(createLocalVue()).useAll()

describe('DocumentAlert.vue', () => {
  it('should NOT display alert on document', () => {
    const wrapper = shallowMount(DocumentAlert, { localVue, router, store, mocks: { $t: msg => msg } })

    expect(wrapper.find('b-alert-stub').exists()).toBeFalsy()
  })

  it('should display alert on document', () => {
    const wrapper = shallowMount(DocumentAlert, { localVue, router, store, mocks: { $t: msg => msg } })
    wrapper.vm.$set(wrapper.vm, 'message', 'lalilou')

    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })
})
