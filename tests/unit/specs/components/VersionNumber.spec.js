import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import VersionNumber from '@/components/VersionNumber'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('VersionNumber.vue', () => {
  let wrapper

  beforeEach(async () => {
    const methods = {
      fetchVersion: () => ({
        'git.build.version': 'X.Y.Z',
        'git.commit.id.abbrev': 'sha1_abbrev'
      })
    }
    wrapper = shallowMount(VersionNumber, { localVue, store, methods, mocks: { $t: msg => msg } })
  })

  it('should display client git sha1', () => {
    const sha1 = wrapper.vm.clientHash

    expect(sha1.match(/[a-z0-9]*/)[0]).toBe(sha1)
    expect(sha1.length).toBe(7)
  })

  it('should display server git sha1 and version', async () => {
    await wrapper.vm.setVersion()

    expect(wrapper.find('.version-number').text()).toBe('Version X.Y.Z')
    expect(wrapper.find('.version-number__tooltip__server__value').text()).toBe('sha1_abbrev')
  })
})
