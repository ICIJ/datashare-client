import { mount, shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import Extensions from '@/components/Extensions'

describe('Extensions.vue', () => {
  const api = {
    getExtensions: vi.fn(),
    installExtensionFromId: vi.fn(),
    installExtensionFromUrl: vi.fn(),
    uninstallExtension: vi.fn()
  }

  const mockedExtensions = [
    {
      id: 'extension_01_id',
      name: 'extension_01_name',
      version: 'extension_01_version',
      description: 'extension_01_description',
      installed: false,
      deliverableFromRegistry: {
        id: 'extension_01_id',
        name: 'extension_01_registry_name',
        version: 'extension_01_version',
        description: 'extension_01_registry_description',
        homepage: 'extension_01_registry_homepage'
      }
    },
    {
      id: 'extension_02_id',
      name: 'extension_02_name',
      version: 'extension_02_version',
      description: 'extension_02_description',
      installed: true,
      deliverableFromRegistry: {
        id: 'extension_02_id',
        name: 'extension_02_registry_name',
        version: 'extension_02_version',
        description: 'extension_02_registry_description',
        homepage: 'extension_02_registry_homepage'
      }
    },
    {
      id: 'extension_03_id',
      name: 'extension_03_name',
      version: null,
      description: 'extension_03_description',
      installed: true,
      deliverableFromRegistry: null
    },
    {
      id: 'extension_04_id',
      name: 'extension_04_name',
      version: 'extension_04_version',
      description: null,
      installed: true,
      deliverableFromRegistry: {
        id: 'extension_04_id',
        name: 'extension_04_registry_name',
        version: 'extension_04_registry_version',
        description: 'extension_04_registry_description',
        homepage: null
      }
    }
  ]

  const core = CoreSetup.init(api).useAll()
  let wrapper

  beforeEach(async () => {
    vi.clearAllMocks()
    api.getExtensions.mockResolvedValue(mockedExtensions)
    wrapper = shallowMount(Extensions, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      }
    })
    await flushPromises()
  })

  it('should display a list of extensions', async () => {
    expect(wrapper.findAll('.extensions__card')).toHaveLength(4)
  })

  describe('extension card', () => {
    beforeEach(async () => {
      wrapper = mount(Extensions, {
        global: {
          plugins: core.plugins
        },
        data: () => {
          return { url: 'this.is.an.url' }
        }
      })
      await flushPromises()
    })

    describe('extension name', () => {
      it('should display name from registry if extension is NOT installed and from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(0)
        expect(card.find('.extensions__card__name').text()).toBe('Extension 01 Registry Name')
      })

      it('should display name from registry if extension is installed and from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(1)
        expect(card.find('.extensions__card__name').text()).toBe('Extension 02 Registry Name')
      })

      it('should display extension name if extension is installed and NOT from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(2)
        expect(card.find('.extensions__card__name').text()).toBe('Extension 03 Name')
      })
    })

    describe('extension description', () => {
      it('should display description from registry if extension is NOT installed and from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(0)
        expect(card.find('.extensions__card__description').text()).toBe('extension_01_registry_description')
      })

      it('should display description from registry if extension is installed and from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(1)
        expect(card.find('.extensions__card__description').text()).toBe('extension_02_registry_description')
      })

      it('should display plugin description if plugin is installed and NOT from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(2)
        expect(card.find('.extensions__card__description').text()).toBe('extension_03_description')
      })
    })

    describe('extension version', () => {
      it('should NOT display the version if extension is NOT installed', () => {
        const card = wrapper.findAll('.extensions__card').at(0)
        expect(card.find('.extensions__card__version').exists()).toBeFalsy()
      })

      it('should display the installed version if extension is installed and has an installed version', () => {
        const card = wrapper.findAll('.extensions__card').at(1)
        expect(card.find('.extensions__card__version').exists()).toBeTruthy()
      })

      it('should NOT display the installed version if extension is installed and has NO installed version', () => {
        const card = wrapper.findAll('.extensions__card').at(2)
        expect(card.find('.extensions__card__version').exists()).toBeFalsy()
      })
    })

    describe('extension official version', () => {
      it('should display the official version if extension is from registry and has an official version', () => {
        const card = wrapper.findAll('.extensions__card').at(0)
        expect(card.find('.extensions__card__official-version').exists()).toBeTruthy()
      })

      it('should NOT display the official version if extension is installed and NOT from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(2)
        expect(card.find('.extensions__card__official-version').exists()).toBeFalsy()
      })
    })

    describe('extension homepage', () => {
      it('should display homepage from registry if extension is NOT installed and from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(0)
        expect(card.find('.extensions__card__homepage').text()).toBe('extension_01_registry_homepage')
      })

      it('should display homepage from registry if extension is installed and from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(1)
        expect(card.find('.extensions__card__homepage').text()).toBe('extension_02_registry_homepage')
      })

      it('should NOT display homepage if extension is installed and NOT from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(2)
        expect(card.find('.extensions__card__homepage').exists()).toBeFalsy()
      })

      it('should NOT display homepage if there is none', () => {
        const card = wrapper.findAll('.extensions__card').at(3)
        expect(card.find('.extensions__card__homepage').exists()).toBeFalsy()
      })
    })

    describe('uninstall button', () => {
      it('should display uninstall button if extension is installed', () => {
        const card = wrapper.findAll('.extensions__card').at(1)
        expect(card.find('.extensions__card__uninstall-button').exists()).toBeTruthy()
      })

      it('should NOT display uninstall button if extension is NOT installed', () => {
        const card = wrapper.findAll('.extensions__card').at(0)
        expect(card.find('.extensions__card__uninstall-button').exists()).toBeFalsy()
      })
    })

    describe('download button', () => {
      it('should display download button if extension is NOT installed', () => {
        const card = wrapper.findAll('.extensions__card').at(0)
        expect(card.find('.extensions__card__download-button').exists()).toBeTruthy()
      })

      it('should NOT display download button if extension is installed', () => {
        const card = wrapper.findAll('.extensions__card').at(1)
        expect(card.find('.extensions__card__download-button').exists()).toBeFalsy()
      })
    })

    describe('update button', () => {
      it('should NOT display update button if extension if installed version and same as registry', () => {
        const card = wrapper.findAll('.extensions__card').at(1)
        expect(card.find('.extensions__card__update-button').exists()).toBeFalsy()
      })

      it('should NOT display update button if extension is installed and NOT from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(2)
        expect(card.find('.extensions__card__update-button').exists()).toBeFalsy()
      })

      it('should display update button if extension is installed and different version from registry', () => {
        const card = wrapper.findAll('.extensions__card').at(3)
        expect(card.find('.extensions__card__update-button').exists()).toBeTruthy()
      })
    })
  })

  it('should search for matching extensions', async () => {
    api.getExtensions.mockReset().mockResolvedValue(mockedExtensions)
    await wrapper.setData({ searchTerm: '02_desc' })
    await wrapper.vm.search()
    await flushPromises()

    expect(api.getExtensions).toBeCalledTimes(1)
    expect(api.getExtensions).toBeCalledWith('02_desc')
  })

  it('should call for extension installation from extensionUrl', () => {
    wrapper = mount(Extensions, {
      global: {
        plugins: core.plugins
      },
      data: () => {
        return { url: 'this.is.an.url' }
      }
    })

    wrapper.vm.installExtensionFromUrl()

    expect(api.installExtensionFromUrl).toBeCalledTimes(1)
    expect(api.installExtensionFromUrl).toBeCalledWith('this.is.an.url')
    expect(wrapper.vm.isInstallingFromUrl).toBeTruthy()
  })
})
