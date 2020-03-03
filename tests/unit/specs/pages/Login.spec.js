import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import Login from '@/pages/Login'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('Login.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Login, { localVue, store, mocks: { $t: msg => msg } })
  })
  it('should display a login link', () => {
    expect(wrapper.findAll('.login__card__body .btn').at(0).text()).toBe('login.xemx')
  })

  it('should display a kelp link', () => {
    expect(wrapper.findAll('.login__card__body .btn').at(1).text()).toBe('login.ask_help')
  })
})
