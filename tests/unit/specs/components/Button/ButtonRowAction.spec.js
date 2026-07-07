import { mount, shallowMount } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur-next'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction.vue'
import IPhTrash from '~icons/ph/trash'

describe('ButtonRowAction.vue', () => {
  it('passes the icon prop to ButtonIcon when no default slot is given', () => {
    const wrapper = shallowMount(ButtonRowAction, { props: { icon: IPhTrash } })
    expect(wrapper.findComponent(ButtonIcon).props('iconLeft')).toBe(IPhTrash)
  })

  it('does not set ButtonIcon iconLeft when a default slot is given', () => {
    const wrapper = shallowMount(ButtonRowAction, {
      props: { icon: IPhTrash },
      slots: { default: '<span class="custom-icon">custom</span>' }
    })
    expect(wrapper.findComponent(ButtonIcon).props('iconLeft')).toBeUndefined()
  })

  it('forwards the default slot content into the "start" slot of ButtonIcon', () => {
    const wrapper = mount(ButtonRowAction, {
      props: { icon: IPhTrash },
      slots: { default: '<span class="custom-icon">custom</span>' }
    })
    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })
})
