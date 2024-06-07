import { mount, shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import Plugins from '@/components/Plugins'

const pluginsMock = [
  {
    id: 'plugin_01_id',
    name: 'plugin_01_name',
    version: 'plugin_01_version',
    description: 'plugin_01_description',
    installed: false,
    deliverableFromRegistry: {
      id: 'plugin_01_id',
      name: 'plugin_01_registry_name',
      version: 'plugin_01_version',
      description: 'plugin_01_registry_description',
      homepage: 'plugin_01_registry_homepage'
    }
  },
  {
    id: 'plugin_02_id',
    name: 'plugin_02_name',
    version: 'plugin_02_version',
    description: 'plugin_02_description',
    installed: true,
    deliverableFromRegistry: {
      id: 'plugin_02_id',
      name: 'plugin_02_registry_name',
      version: 'plugin_02_version',
      description: 'plugin_02_registry_description',
      homepage: 'plugin_02_registry_homepage'
    }
  },
  {
    id: 'plugin_03_id',
    name: 'plugin_03_name',
    version: null,
    description: 'plugin_03_description',
    installed: true,
    deliverableFromRegistry: null
  },
  {
    id: 'plugin_04_id',
    name: 'plugin_04_name',
    version: 'plugin_04_version',
    description: null,
    installed: true,
    deliverableFromRegistry: {
      id: 'plugin_04_id',
      name: 'plugin_04_registry_name',
      version: 'plugin_04_registry_version',
      description: 'plugin_04_registry_description',
      homepage: null
    }
  }
]

describe('Plugins.vue', () => {
  const api = {
    getPlugins: vi.fn(),
    installPluginFromId: vi.fn(),
    installPluginFromUrl: vi.fn(),
    uninstallPlugin: vi.fn()
  }

  let wrapper

  beforeEach(async () => {
    vi.clearAllMocks()
    api.getPlugins.mockResolvedValue(pluginsMock)
    const { plugins } = CoreSetup.init(api).useAll()
    wrapper = shallowMount(Plugins, {
      global: {
        plugins,
        renderStubDefaultSlot: true
      },
      data: () => {
        return { url: 'this.is.an.url' }
      }
    })
    await flushPromises()
  })

  it('should display a button to install a plugin from url', () => {
    expect(wrapper.find('.plugins__add b-button-stub').exists()).toBeTruthy()
  })

  it('should display a modal to install a plugin from url', () => {
    expect(wrapper.find('.plugins__add b-modal-stub').exists()).toBeTruthy()
  })

  it('should display a search bar', () => {
    expect(wrapper.find('.plugins__search').exists()).toBeTruthy()
    expect(wrapper.find('.plugins__search search-form-control-stub').exists()).toBeTruthy()
  })

  it('should display a list of plugins', () => {
    expect(wrapper.findAll('.plugins__card')).toHaveLength(4)
  })

  describe('plugin card', () => {
    let wrapper

    beforeEach(async () => {
      const { plugins } = CoreSetup.init(api).useAll()
      wrapper = mount(Plugins, {
        global: {
          plugins
        },
        data: () => {
          return { url: 'this.is.an.url' }
        }
      })
      await flushPromises()
    })

    describe('plugin name', () => {
      it('should display name from registry if plugin is NOT installed and from registry', () => {
        const name = wrapper.findAll('.plugins__card').at(0).find('.plugins__card__name')
        expect(name.text()).toBe('Plugin 01 Registry Name')
      })

      it('should display name from registry if plugin is installed and from registry', () => {
        const name = wrapper.findAll('.plugins__card').at(1).find('.plugins__card__name')
        expect(name.text()).toBe('Plugin 02 Registry Name')
      })

      it('should display plugin name if plugin is installed and NOT from registry', () => {
        const name = wrapper.findAll('.plugins__card').at(2).find('.plugins__card__name')
        expect(name.text()).toBe('Plugin 03 Name')
      })
    })

    describe('plugin description', () => {
      it('should display description from registry if plugin is NOT installed and from registry', () => {
        const desc = wrapper.findAll('.plugins__card').at(0).find('.plugins__card__description')
        expect(desc.text()).toBe('plugin_01_registry_description')
      })

      it('should display description from registry if plugin is installed and from registry', () => {
        const desc = wrapper.findAll('.plugins__card').at(1).find('.plugins__card__description')
        expect(desc.text()).toBe('plugin_02_registry_description')
      })

      it('should display plugin description if plugin is installed and NOT from registry', () => {
        const desc = wrapper.findAll('.plugins__card').at(2).find('.plugins__card__description')
        expect(desc.text()).toBe('plugin_03_description')
      })
    })

    describe('plugin version', () => {
      it('should NOT display the installed version if plugin is NOT installed', () => {
        const version = wrapper.findAll('.plugins__card').at(0).find('.plugins__card__version')
        expect(version.exists()).toBeFalsy()
      })

      it('should display the installed version if plugin is installed and has an installed version', () => {
        const version = wrapper.findAll('.plugins__card').at(1).find('.plugins__card__version')
        expect(version.exists()).toBeTruthy()
      })

      it('should NOT display the installed version if plugin is installed and has NO installed version', () => {
        const version = wrapper.findAll('.plugins__card').at(2).find('.plugins__card__version')
        expect(version.exists()).toBeFalsy()
      })
    })

    describe('plugin official version', () => {
      it('should display the official version if plugin is from registry and has an official version', () => {
        const officialVersion = wrapper.findAll('.plugins__card').at(0).find('.plugins__card__official-version')
        expect(officialVersion.exists()).toBeTruthy()
      })

      it('should NOT display the official version if plugin is installed and NOT from registry', () => {
        const officialVersion = wrapper.findAll('.plugins__card').at(2).find('.plugins__card__official-version')
        expect(officialVersion.exists()).toBeFalsy()
      })
    })

    describe('plugin homepage', () => {
      it('should display homepage from registry if plugin is NOT installed and from registry', () => {
        const homepage = wrapper.findAll('.plugins__card').at(0).find('.plugins__card__homepage')
        expect(homepage.text()).toBe('plugin_01_registry_homepage')
      })

      it('should display homepage from registry if plugin is installed and from registry', () => {
        const homepage = wrapper.findAll('.plugins__card').at(1).find('.plugins__card__homepage')
        expect(homepage.text()).toBe('plugin_02_registry_homepage')
      })

      it('should NOT display homepage if plugin is installed and NOT from registry', () => {
        const homepage = wrapper.findAll('.plugins__card').at(2).find('.plugins__card__homepage')
        expect(homepage.exists()).toBeFalsy()
      })

      it('should NOT display homepage if there is none', () => {
        const homepage = wrapper.findAll('.plugins__card').at(3).find('.plugins__card__homepage')
        expect(homepage.exists()).toBeFalsy()
      })
    })

    describe('uninstall button', () => {
      it('should display uninstall button if plugin is installed', () => {
        const uninstallButton = wrapper.findAll('.plugins__card').at(1).find('.plugins__card__uninstall-button')
        expect(uninstallButton.exists()).toBeTruthy()
      })

      it('should NOT display uninstall button if plugin is NOT installed', () => {
        const uninstallButton = wrapper.findAll('.plugins__card').at(0).find('.plugins__card__uninstall-button')
        expect(uninstallButton.exists()).toBeFalsy()
      })
    })

    describe('download button', () => {
      it('should display download button if plugin is NOT installed', () => {
        const downloadButton = wrapper.findAll('.plugins__card').at(0).find('.plugins__card__download-button')
        expect(downloadButton.exists()).toBeTruthy()
      })

      it('should NOT display download button if plugin is installed', () => {
        const downloadButton = wrapper.findAll('.plugins__card').at(1).find('.plugins__card__download-button')
        expect(downloadButton.exists()).toBeFalsy()
      })
    })

    describe('update button', () => {
      it('should NOT display update button if plugin if installed version and same as registry', () => {
        const updateButton = wrapper.findAll('.plugins__card').at(1).find('.plugins__card__update-button')
        expect(updateButton.exists()).toBeFalsy()
      })

      it('should NOT display update button if plugin is installed and NOT from registry', () => {
        const updateButton = wrapper.findAll('.plugins__card').at(2).find('.plugins__card__update-button')
        expect(updateButton.exists()).toBeFalsy()
      })

      it('should display update button if plugin is installed and different version from registry', () => {
        const updateButton = wrapper.findAll('.plugins__card').at(3).find('.plugins__card__update-button')
        expect(updateButton.exists()).toBeTruthy()
      })
    })
  })

  it('should search for matching plugins', async () => {
    api.getPlugins.mockReset().mockResolvedValue(pluginsMock)
    await wrapper.setData({ searchTerm: '02_desc' })
    await wrapper.vm.search()

    expect(api.getPlugins).toBeCalledTimes(1)
    expect(api.getPlugins).toBeCalledWith('02_desc')
  })

  it('should call for plugin installation from pluginUrl', () => {
    const { plugins } = CoreSetup.init(api).useAll()
    wrapper = mount(Plugins, {
      global: {
        plugins
      },
      data: () => {
        return { url: 'this.is.an.url' }
      }
    })
    wrapper.vm.installPluginFromUrl()

    expect(api.installPluginFromUrl).toBeCalledTimes(1)
    expect(api.installPluginFromUrl).toBeCalledWith('this.is.an.url')
    expect(wrapper.vm.isInstallingFromUrl).toBeTruthy()
  })
})
