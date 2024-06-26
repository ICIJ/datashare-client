import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import PageHeader from '@/components/PageHeader'

describe('PageHeader.vue', () => {
  const { plugins } = CoreSetup.init().useAll()
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(PageHeader, {
      global: {
        plugins
      },
      props: {
        description: 'This is my description',
        title: 'This is my title'
      }
    })
  })

  it('should NOT display a PageIcon', () => {
    expect(wrapper.find('page-icon-stub').exists()).toBeFalsy()
  })

  it('should display a PageIcon', async () => {
    await wrapper.setProps({ icon: 'icon' })

    expect(wrapper.find('page-icon-stub').exists()).toBeTruthy()
  })

  it('should display a title', () => {
    expect(wrapper.find('.page-header__title').exists()).toBeTruthy()
    expect(wrapper.find('.page-header__title').text()).toBe('This is my title')
  })

  it('should display a description', () => {
    expect(wrapper.find('.page-header__description').exists()).toBeTruthy()
    expect(wrapper.find('.page-header__description').text()).toBe('This is my description')
  })
})
