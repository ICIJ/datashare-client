import { createLocalVue, shallowMount } from '@vue/test-utils'

import VersionNumber from '@/components/VersionNumber'
import { Core } from '@/core'
import { Api } from '@/api'
import { getMode, MODE_NAME } from '@/mode'

describe('VersionNumber.vue', () => {
  let i18n, localVue, store, wrapper, mockAxios

  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    const api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api, getMode(MODE_NAME.SERVER)).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
  })

  beforeEach(() => {
    mockAxios.request.mockClear()
    mockAxios.request.mockResolvedValue({
      data: {
        'git.build.version': 'X.Y.Z',
        'git.commit.id.abbrev': 'sha1_abbrev'
      }
    })
    wrapper = shallowMount(VersionNumber, { i18n, localVue, store })
  })

  it('should display client git sha1', () => {
    const sha1 = wrapper.vm.clientHash

    expect(sha1.match(/[a-z0-9]*/)[0]).toBe(sha1)
    expect(sha1).toHaveLength(7)
  })

  it('should display server git sha1 and version', async () => {
    await wrapper.vm.setVersion()

    expect(wrapper.find('.version-number').text()).toBe('Version X.Y.Z')
    expect(wrapper.find('.version-number__tooltip__server__value').text()).toBe('sha1_abbrev')
  })
})
