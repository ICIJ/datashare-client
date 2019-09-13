import { createLocalVue, shallowMount } from '@vue/test-utils'
import ShortkeysModal from '@/components/ShortkeysModal'
import store from '@/store'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(Murmur)

describe('ShortkeysModal.vue', () => {
  it('should display the shortkeys modal', () => {
    const wrapper = shallowMount(ShortkeysModal, { localVue, store, mocks: { $t: msg => msg } })

    expect(wrapper.findAll('.shortkeys-modal').exists()).toBeTruthy()
  })
})
