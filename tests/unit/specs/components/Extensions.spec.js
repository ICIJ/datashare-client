import { createLocalVue, shallowMount } from '@vue/test-utils'

import Extensions from '@/components/Extensions'
import { Core } from '@/core'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({
      data: [{
        id: 'extension_01_id',
        name: 'extension_01_name',
        version: 'extension_01_version',
        description: 'extension_01_description'
      }, {
        id: 'extension_02_id',
        name: 'extension_02_name',
        version: 'extension_02_version',
        description: 'extension_02_description'
      }]
    })
  }
})

describe('Extensions.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(async () => {
    wrapper = await shallowMount(Extensions, { i18n, localVue })
  })

  afterAll(() => jest.unmock('axios'))

  it('should display a list of extensions', async () => {
    expect(wrapper.findAll('.extensions .extensions__card')).toHaveLength(2)
  })
})
