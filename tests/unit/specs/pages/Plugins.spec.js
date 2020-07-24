import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import Plugins from '@/pages/Plugins'

describe('Api.vue', () => {
  const { i18n, localVue, router, store } = Core.init(createLocalVue()).useAll()

  it('should display a list of plugins', async () => {
    const wrapper = shallowMount(Plugins, { i18n, localVue, router, store })
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
      }]
    })

    expect(wrapper.findAll('.plugins__plugin')).toHaveLength(2)
  })
})
