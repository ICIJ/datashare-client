import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import Plugins from '@/pages/Plugins'

describe('Api.vue', () => {
  const { i18n, localVue, router, store } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(Plugins, { i18n, localVue, router, store })
  })

  it('should display a search bar', () => {
    expect(wrapper.find('.plugins__search')).toBeTruthy()
    expect(wrapper.find('.plugins__search b-form-input-stub')).toBeTruthy()
  })

  it('should display a list of plugins', async () => {
    await wrapper.setData({
      filteredPlugins: [{
        id: 'plugin_01_id',
        name: 'plugin_01_name',
        version: 'plugin_01_version',
        description: 'plugin_01_description'
      }, {
        id: 'plugin_02_id',
        name: 'plugin_02_name',
        version: 'plugin_02_version',
        description: 'plugin_02_description'
      }]
    })

    expect(wrapper.findAll('.plugins__plugin')).toHaveLength(2)
  })

  it('should search for matching plugins', async () => {
    await wrapper.setData({
      plugins: [{
        id: 'plugin_01_id',
        name: 'plugin_01_name',
        version: 'plugin_01_version',
        description: 'plugin_01_description'
      }, {
        id: 'plugin_02_id',
        name: 'plugin_02_name',
        version: 'plugin_02_version',
        description: 'plugin_02_description'
      }],
      searchTerm: '02_desc'
    })

    wrapper.vm.search()

    expect(wrapper.vm.filteredPlugins).toHaveLength(1)
    expect(wrapper.vm.filteredPlugins[0]).toMatchObject({
      id: 'plugin_02_id',
      name: 'plugin_02_name',
      version: 'plugin_02_version',
      description: 'plugin_02_description'
    })
  })
})
