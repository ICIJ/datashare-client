import { shallowMount } from '@vue/test-utils'

import VersionNumber from '@/components/VersionNumber'
import { Core } from '@/core'
import { getMode, MODE_NAME } from '@/mode'

describe('VersionNumber.vue', () => {
  let core, wrapper

  beforeAll(() => {
    const api = {
      getVersion: vi.fn().mockResolvedValue({
        'git.tag': 'X.Y.Z',
        'git.commit.id.abbrev': 'sha1_abbrev'
      })
    }
    core = Core.init(api, getMode(MODE_NAME.SERVER)).useAll()
  })

  beforeEach(() => {
    wrapper = shallowMount(VersionNumber, {
      global: {
        plugins: [core.plugin, core.store, core.i18n],
        renderStubDefaultSlot: true
      }
    })
  })

  it('should display client git sha1', () => {
    const sha1 = wrapper.vm.shortClientHash

    expect(sha1.match(/[a-z0-9]*/)[0]).toBe(sha1)
    expect(sha1).toHaveLength(7)
  })

  it('should display server git sha1 and version', async () => {
    await wrapper.vm.setVersion()
    expect(wrapper.find('.version-number').text()).toBe('Version X.Y.Z')
    expect(wrapper.find('.version-number__tooltip__server__value').text()).toBe('sha1_abbrev')
  })
})
