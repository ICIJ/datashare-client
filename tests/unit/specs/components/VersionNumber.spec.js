import { mount } from '@vue/test-utils'

import VersionNumber from '@/components/VersionNumber'
import { Core } from '@/core'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getVersion: vi.fn().mockResolvedValue({
        'git.tag': 'X.Y.Z',
        'git.commit.id.abbrev': 'sha1_abbrev'
      })
    }
  }
})

describe('VersionNumber.vue', () => {
  let core, attachTo, wrapper

  function createContainer() {
    const container = document.createElement('div')
    document.body.appendChild(container)
    return container
  }

  beforeAll(() => {
    core = Core.init().useAll()
  })

  beforeEach(() => {
    attachTo = createContainer()

    wrapper = mount(VersionNumber, {
      attachTo,
      global: {
        plugins: [core.plugin, core.i18n],
        renderStubDefaultSlot: true
      }
    })
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should have client git sha1', () => {
    const sha1 = wrapper.vm.shortClientHash

    expect(sha1.match(/[a-z0-9]*/)[0]).toBe(sha1)
    expect(sha1).toHaveLength(7)
  })

  it('should display server version', async () => {
    await wrapper.vm.setVersion()
    expect(wrapper.find('.version-number').text()).toBe('vX.Y.Z')
  })

  it('should display git sha1 in a tooltip', async () => {
    await wrapper.vm.setVersion()
    const body = attachTo.closest('body')
    const abbrev = body.querySelector('.version-number__tooltip__server__value')?.textContent?.trim()
    expect(abbrev).toBe('sha1_abbrev')
  })
})
