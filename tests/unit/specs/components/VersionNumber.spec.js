import { createLocalVue, shallowMount } from '@vue/test-utils'

import VersionNumber from '@/components/VersionNumber'
import { Core } from '@/core'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({
      data: {
        'git.build.version': 'X.Y.Z',
        'git.commit.id.abbrev': 'sha1_abbrev'
      }
    })
  }
})

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()

describe('VersionNumber.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(VersionNumber, { i18n, localVue, store })
  })

  afterAll(() => jest.unmock('axios'))

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
