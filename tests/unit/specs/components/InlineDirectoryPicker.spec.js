import { createLocalVue, mount } from '@vue/test-utils'

import { flushPromises } from 'tests/unit/tests_utils'
import InlineDirectoryPicker from '@/components/InlineDirectoryPicker'
import { Core } from '@/core'

const HOME_TREE = [
  {
    name: '/home/dev/Datashare',
    type: 'directory',
    prot: 'drwxrwxrwx',
    children: [
      {
        prot: 'drwxr-xr-x',
        children: [],
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
  },
  {
    directories: 1,
    files: 2,
    type: 'report'
  }
]

const HOME_01FOO_TREE = [
  {
    name: '/home/dev/Datashare/01FOO',
    type: 'directory',
    prot: 'drwxrwxrwx',
    children: [
      {
        prot: 'drwxr-xr-x',
        children: [],
        name: '/home/dev/Datashare/01FOO/pandora',
        type: 'directory'
      },
      {
        prot: 'drwxr-xr-x',
        children: [],
        name: '/home/dev/Datashare/01FOO/paradise',
        type: 'directory'
      },
      {
        prot: 'drwxr-xr-x',
        children: [],
        name: '/home/dev/Datashare/01FOO/panama',
        type: 'directory'
      }
    ]
  },
  {
    directories: 3,
    files: 0,
    type: 'report'
  }
]

describe('InlineDirectoryPicker.vue', () => {
  describe('without path', () => {
    let wrapper

    beforeEach(() => {
      const api = jest.fn()
      const { localVue, i18n, wait, store, config } = Core.init(createLocalVue(), api).useAll()
      config.set('dataDir', '/home/dev/Datashare/')
      wrapper = mount(InlineDirectoryPicker, { localVue, i18n, wait, store })
    })

    it('should render the directory list with only "Home"', () => {
      const directories = wrapper.findAll('.inline-directory-picker__header__list__item')
      expect(directories).toHaveLength(1)
      expect(directories.at(0).text()).toBe('Home')
    })

    it('should render the "Home" tree when clicking on "Browse"', async () => {
      wrapper.vm.$core.api.tree = jest.fn().mockResolvedValue(HOME_TREE)
      wrapper.find('.inline-directory-picker__header__browse').trigger('click')
      await flushPromises()
      const subDirectories = wrapper.findAll('.inline-directory-picker__browser__item__link')
      expect(subDirectories).toHaveLength(1)
      expect(subDirectories.at(0).text()).toBe('01FOO')
    })

    it('should close the browsing tree when clicking again on the browsing button', async () => {
      wrapper.vm.$core.api.tree = jest.fn().mockResolvedValue(HOME_TREE)
      wrapper.find('.inline-directory-picker__header__browse').trigger('click')
      await flushPromises()
      expect(wrapper.vm.browse).toBeTruthy()
      wrapper.find('.inline-directory-picker__header__browse').trigger('click')
      await flushPromises()
      expect(wrapper.vm.browse).toBeFalsy()
    })

    it('should show a "Close" label on the browsing when browsing', async () => {
      wrapper.vm.$core.api.tree = jest.fn().mockResolvedValue(HOME_TREE)
      const btn = wrapper.find('.inline-directory-picker__header__browse')
      expect(btn.text()).toBe('Browse')
      btn.trigger('click')
      await flushPromises()
      expect(btn.text()).toBe('Close')
    })

    it('should enter the "01FOO" tree when clicking on the sub-directory', async () => {
      // Load the sub directories from Home
      wrapper.vm.$core.api.tree = jest.fn().mockResolvedValue(HOME_TREE)
      wrapper.find('.inline-directory-picker__header__browse').trigger('click')
      await flushPromises()
      // Load the sub directories from HOME/01FOO
      wrapper.vm.$core.api.tree = jest.fn().mockResolvedValue(HOME_01FOO_TREE)
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
      wrapper.vm.$core.api.tree = jest.fn().mockResolvedValue(HOME_TREE)
      wrapper.find('.inline-directory-picker__header__browse').trigger('click')
      await flushPromises()
      // Select the first directory
      wrapper.findAll('.inline-directory-picker__browser__item__link').at(0).trigger('click')
      await flushPromises()
      expect(wrapper.emitted().input).toBeDefined()
      expect(wrapper.emitted().input).toHaveLength(1)
      expect(wrapper.emitted().input[0]).toEqual(['/home/dev/Datashare/01FOO'])
    })
  })

  describe('with path "/home/dev/Datashare/01FOO"', () => {
    let wrapper

    beforeEach(() => {
      const api = jest.fn()
      const path = '/home/dev/Datashare/01FOO'
      const propsData = { path }
      const { localVue, i18n, wait, store, config } = Core.init(createLocalVue(), api).useAll()
      config.set('dataDir', '/home/dev/Datashare/')
      wrapper = mount(InlineDirectoryPicker, { localVue, i18n, wait, store, propsData })
      wrapper.vm.$core.api.tree = jest.fn().mockResolvedValue(HOME_01FOO_TREE)
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
      expect(wrapper.emitted().input).toBeDefined()
      expect(wrapper.emitted().input).toHaveLength(1)
      expect(wrapper.emitted().input[0]).toEqual(['/home/dev/Datashare'])
    })
  })
})
