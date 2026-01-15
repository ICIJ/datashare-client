import { shallowMount } from '@vue/test-utils'

import { Core } from '@/core'

describe('ComponentsMixin', () => {
  let core, localVue

  beforeEach(() => {
    core = Core.init().useAll()
  })

  it('should find component by name with exact match', async () => {
    const ButtonRecommendation = await core.findComponent('Button/ButtonRecommendation')
    expect(ButtonRecommendation.name).toBe('ButtonRecommendation')
  })

  it('should find component by name with wrong case', async () => {
    const ButtonRecommendation = await core.findComponent('Button/buttonRecommendation')
    expect(ButtonRecommendation.name).toBe('ButtonRecommendation')
  })

  it('should find component by name with kebab case', async () => {
    const ButtonRecommendation = await core.findComponent('Button/button-recommendation')
    expect(ButtonRecommendation.name).toBe('ButtonRecommendation')
  })

  it('should find component by name with underscore case', async () => {
    const ButtonRecommendation = await core.findComponent('Button/button_recommendation')
    expect(ButtonRecommendation.name).toBe('ButtonRecommendation')
  })

  it('should return null with unknown component', async () => {
    expect(await core.findComponent('Button/foo')).toBeNull()
  })

  it('should throw an exception with unknown component', async () => {
    expect.assertions(1)
    try {
      await core.getComponent('foo')
    }
    catch (e) {
      expect(e.message).toEqual('Cannot find component \'foo\'')
    }
  })

  it('should find an instantiable component', async () => {
    const ButtonRecommendation = await core.findComponent('Button/ButtonRecommendation')
    const wrapper = shallowMount(ButtonRecommendation, { localVue })
    expect(wrapper.findComponent({ name: 'ButtonRecommendation' }).exists()).toBeTruthy()
  })

  it('should find component in sub-folder', async () => {
    const WidgetDiskUsage = await core.findComponent('Widget/WidgetDiskUsage')
    expect(WidgetDiskUsage.name).toBe('WidgetDiskUsage')
  })

  describe('Murmur components', () => {
    it('should find Murmur component by name', async () => {
      const AppIcon = await core.findComponent('Murmur/AppIcon')
      expect(AppIcon).not.toBeNull()
    })

    it('should find Murmur datavisualisations component', async () => {
      const BarChart = await core.findComponent('Murmur/BarChart')
      expect(BarChart).not.toBeNull()
      expect(BarChart.name).toBe('BarChart')
    })

    it('should find Murmur maps component', async () => {
      const ChoroplethMap = await core.findComponent('Murmur/ChoroplethMap')
      expect(ChoroplethMap).not.toBeNull()
      expect(ChoroplethMap.name).toBe('ChoroplethMap')
    })

    it('should return null for unknown Murmur component', async () => {
      expect(await core.findComponent('Murmur/NonExistentComponent')).toBeNull()
    })

    it('should throw an exception for unknown Murmur component with getComponent', async () => {
      expect.assertions(1)
      try {
        await core.getComponent('Murmur/NonExistentComponent')
      } catch (e) {
        expect(e.message).toEqual("Cannot find Murmur component 'NonExistentComponent'")
      }
    })

    it('should get Murmur component directly with getMurmurComponent', () => {
      const ButtonIcon = core.getMurmurComponent('ButtonIcon')
      expect(ButtonIcon).not.toBeNull()
      expect(ButtonIcon.name).toBe('ButtonIcon')
    })

    it('should return null for unknown component with getMurmurComponent', () => {
      expect(core.getMurmurComponent('NonExistentComponent')).toBeNull()
    })
  })
})
