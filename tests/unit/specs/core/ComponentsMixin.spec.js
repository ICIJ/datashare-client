import { shallowMount } from '@vue/test-utils'

import { Core } from '@/core'

describe('ComponentsMixin', () => {
  let core, localVue

  beforeEach(() => {
    core = Core.init().useAll()
  })

  it('should find component by name with exact match', async () => {
    const ButtonIcon = await core.findComponent('Button/ButtonIcon')
    expect(ButtonIcon.name).toBe('ButtonIcon')
  })

  it('should find component by name with wrong case', async () => {
    const ButtonIcon = await core.findComponent('Button/buttonIcon')
    expect(ButtonIcon.name).toBe('ButtonIcon')
  })

  it('should find component by name with kebab case', async () => {
    const ButtonIcon = await core.findComponent('Button/button-icon')
    expect(ButtonIcon.name).toBe('ButtonIcon')
  })

  it('should find component by name with underscore case', async () => {
    const ButtonIcon = await core.findComponent('Button/button_icon')
    expect(ButtonIcon.name).toBe('ButtonIcon')
  })

  it('should return null with unknown component', async () => {
    expect(await core.findComponent('Button/foo')).toBeNull()
  })

  it('should throw an exception with unknown component', async () => {
    expect.assertions(1)
    try {
      await core.getComponent('foo')
    } catch (e) {
      expect(e.message).toEqual("Cannot find component 'foo'")
    }
  })

  it('should find an instantiable component', async () => {
    const ButtonIcon = await core.findComponent('Button/ButtonIcon')
    const wrapper = shallowMount(ButtonIcon, { localVue })
    expect(wrapper.findComponent({ name: 'ButtonIcon' }).exists()).toBeTruthy()
  })

  it('should find component in sub-folder', async () => {
    const WidgetDiskUsage = await core.findComponent('Widget/WidgetDiskUsage')
    expect(WidgetDiskUsage.name).toBe('WidgetDiskUsage')
  })
})
