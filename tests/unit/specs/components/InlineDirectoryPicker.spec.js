import { mount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import InlineDirectoryPicker from '@/components/InlineDirectoryPicker'

const HOME_TREE = {
  name: '/home/dev/Datashare',
  type: 'directory',
  prot: 'drwxrwxrwx',
  contents: [
    {
      prot: 'drwxr-xr-x',
      contents: [],
      name: '/home/dev/Datashare/01FOO',
      type: 'directory'
    },
    {
      prot: '-rw-rw-r--',
      size: 9850,
      name: '/home/dev/Datashare/02BAR.ods',
      type: 'file'
    },
    {
      prot: '-rw-rw-r--',
      size: 73904,
      name: '/home/dev/Datashare/03BUS.tif',
      type: 'file'
    }
  ]
}

const HOME_01FOO_TREE = {
  name: '/home/dev/Datashare/01FOO',
  type: 'directory',
  prot: 'drwxrwxrwx',
  contents: [
    {
      prot: 'drwxr-xr-x',
      contents: [],
      name: '/home/dev/Datashare/01FOO/pandora',
      type: 'directory'
    },
    {
      prot: 'drwxr-xr-x',
      contents: [],
      name: '/home/dev/Datashare/01FOO/paradise',
      type: 'directory'
    },
    {
      prot: 'drwxr-xr-x',
      contents: [],
      name: '/home/dev/Datashare/01FOO/panama',
      type: 'directory'
    }
  ]
}

describe('InlineDirectoryPicker.vue', () => {
  let api

  beforeAll(() => {
    api = {
      tree: vi.fn()
    }
  })

  beforeEach(() => {
    api.tree.mockClear()
  })

  describe('without path', () => {
    let wrapper

    beforeEach(() => {
      const { plugins, config } = CoreSetup.init(api).useAll()
      config.set('dataDir', '/home/dev/Datashare/')
      wrapper = mount(InlineDirectoryPicker, { global: { plugins } })
    })

    it('should render the directory list with only "Home"', () => {
      const directories = wrapper.findAll('.inline-directory-picker__header__list__item')
      expect(directories).toHaveLength(1)
      expect(directories.at(0).text()).toBe('Home')
    })

    it('should render the "Home" tree when clicking on "Browse"', async () => {
      api.tree.mockResolvedValue(HOME_TREE)
      wrapper.find('.inline-directory-picker__header__browse').trigger('click')
      await flushPromises()
      const subDirectories = wrapper.findAll('.inline-directory-picker__browser__item__link')
      expect(subDirectories).toHaveLength(1)
      expect(subDirectories.at(0).text()).toBe('01FOO')
    })

    it('should close the browsing tree when clicking again on the browsing button', async () => {
      api.tree.mockResolvedValue(HOME_TREE)
      wrapper.find('.inline-directory-picker__header__browse').trigger('click')
      await flushPromises()
      expect(wrapper.vm.browse).toBeTruthy()
      wrapper.find('.inline-directory-picker__header__browse').trigger('click')
      await flushPromises()
      expect(wrapper.vm.browse).toBeFalsy()
    })

    it('should show a "Close" label on the browsing when browsing', async () => {
      api.tree.mockResolvedValue(HOME_TREE)
      const btn = wrapper.find('.inline-directory-picker__header__browse')
      expect(btn.text()).toBe('Browse')
      btn.trigger('click')
      await flushPromises()
      expect(btn.text()).toBe('Close')
    })

    it('should enter the "01FOO" tree when clicking on the sub-directory', async () => {
      // Load the sub directories from Home
      api.tree.mockResolvedValue(HOME_TREE)
      wrapper.find('.inline-directory-picker__header__browse').trigger('click')
      await flushPromises()
      // Load the sub directories from HOME/01FOO
      api.tree.mockResolvedValue(HOME_01FOO_TREE)
      wrapper.findAll('.inline-directory-picker__browser__item__link').at(0).trigger('click')
      await flushPromises()

      const subDirectories = wrapper.findAll('.inline-directory-picker__browser__item__link')
      expect(subDirectories).toHaveLength(3)
      expect(subDirectories.at(0).text()).toBe('pandora')
      expect(subDirectories.at(1).text()).toBe('paradise')
      expect(subDirectories.at(2).text()).toBe('panama')
    })

    it('should display the correct breadcrump when selecting "01FOO"', async () => {
      await wrapper.setProps({ path: '/home/dev/Datashare/01FOO/' })
      const directories = wrapper.findAll('.inline-directory-picker__header__list__item')
      expect(directories).toHaveLength(2)
      expect(directories.at(0).text()).toBe('Home')
      expect(directories.at(1).text()).toBe('01FOO')
    })

    it('should emit an input event when selecting "01FOO" in the browsing tree', async () => {
      // Start to browse tree
      api.tree.mockResolvedValue(HOME_TREE)
      wrapper.find('.inline-directory-picker__header__browse').trigger('click')
      await flushPromises()
      // Select the first directory
      wrapper.findAll('.inline-directory-picker__browser__item__link').at(0).trigger('click')
      await flushPromises()
      expect(wrapper.emitted()).toHaveProperty('update:path')
      expect(wrapper.emitted('update:path')).toHaveLength(1)
      expect(wrapper.emitted('update:path').pop()).toEqual(['/home/dev/Datashare/01FOO'])
    })
  })

  describe('with path "/home/dev/Datashare/01FOO"', () => {
    let wrapper

    beforeEach(() => {
      const path = '/home/dev/Datashare/01FOO'
      const props = { path }
      const { plugins, config } = CoreSetup.init(api).useAll()
      config.set('dataDir', '/home/dev/Datashare/')
      wrapper = mount(InlineDirectoryPicker, { global: { plugins }, props })
      api.tree.mockResolvedValue(HOME_01FOO_TREE)
      config.set('dataDir', '/home/dev/Datashare/')
    })

    it('should render the directory list with "Home" and "01FOO"', () => {
      const directories = wrapper.findAll('.inline-directory-picker__header__list__item')
      expect(directories).toHaveLength(2)
      expect(directories.at(0).text()).toBe('Home')
      expect(directories.at(1).text()).toBe('01FOO')
    })

    it('should update the directory list with only "Home" when path change', async () => {
      await wrapper.setProps({ path: null })
      const directories = wrapper.findAll('.inline-directory-picker__header__list__item')
      expect(directories).toHaveLength(1)
      expect(directories.at(0).text()).toBe('Home')
    })

    it('should emit an input event when clicking on "Home"', async () => {
      wrapper.findAll('.inline-directory-picker__header__list__item').at(0).trigger('click')
      await flushPromises()
      expect(wrapper.emitted()).toHaveProperty('update:path')
      expect(wrapper.emitted('update:path')).toHaveLength(1)
      expect(wrapper.emitted('update:path').pop()).toEqual(['/home/dev/Datashare'])
    })
  })
})
