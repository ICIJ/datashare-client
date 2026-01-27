import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsSnapshotsSetup from '@/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup'

describe('SettingsSnapshotsSetup', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComponent(props = {}) {
    return mount(SettingsSnapshotsSetup, {
      global: { plugins },
      props: {
        availablePaths: [],
        pathsLoaded: false,
        hasAvailablePaths: false,
        hasSinglePath: false,
        isLoading: false,
        ...props
      }
    })
  }

  it('should render the setup component', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.settings-snapshots-setup').exists()).toBeTruthy()
  })

  describe('loading state', () => {
    it('should display loading spinner when paths are not loaded', () => {
      const wrapper = mountComponent({ pathsLoaded: false })
      expect(wrapper.find('.settings-snapshots-setup__loading').exists()).toBeTruthy()
      expect(wrapper.find('.spinner-border').exists()).toBeTruthy()
    })

    it('should not display form when loading', () => {
      const wrapper = mountComponent({ pathsLoaded: false })
      expect(wrapper.find('.settings-snapshots-setup__form').exists()).toBeFalsy()
    })
  })

  describe('no paths available state', () => {
    it('should display warning when no paths are available', () => {
      const wrapper = mountComponent({ pathsLoaded: true, hasAvailablePaths: false })
      expect(wrapper.find('.settings-snapshots-setup__no-paths').exists()).toBeTruthy()
    })

    it('should display warning title', () => {
      const wrapper = mountComponent({ pathsLoaded: true, hasAvailablePaths: false })
      expect(wrapper.find('.settings-snapshots-setup__title').exists()).toBeTruthy()
    })

    it('should not display form when no paths available', () => {
      const wrapper = mountComponent({ pathsLoaded: true, hasAvailablePaths: false })
      expect(wrapper.find('.settings-snapshots-setup__form').exists()).toBeFalsy()
    })
  })

  describe('paths available state', () => {
    const availablePaths = ['/backup/path1', '/backup/path2']

    function mountWithPaths(props = {}) {
      return mountComponent({
        availablePaths,
        pathsLoaded: true,
        hasAvailablePaths: true,
        ...props
      })
    }

    it('should display the title', () => {
      const wrapper = mountWithPaths()
      expect(wrapper.find('.settings-snapshots-setup__title').exists()).toBeTruthy()
    })

    it('should display the path select', () => {
      const wrapper = mountWithPaths()
      expect(wrapper.find('#repository-path').exists()).toBeTruthy()
    })

    it('should display the form', () => {
      const wrapper = mountWithPaths()
      expect(wrapper.find('.settings-snapshots-setup__form').exists()).toBeTruthy()
    })

    it('should auto-select the first path', () => {
      const wrapper = mountWithPaths()
      const select = wrapper.find('#repository-path')
      expect(select.element.value).toBe('/backup/path1')
    })

    it('should emit submit event with selected path when form is submitted', async () => {
      const wrapper = mountWithPaths()
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted('submit')).toEqual([['/backup/path1']])
    })

    it('should emit submit event with different selected path', async () => {
      const wrapper = mountWithPaths()
      const select = wrapper.find('#repository-path')
      await select.setValue('/backup/path2')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted('submit')).toEqual([['/backup/path2']])
    })

    it('should disable select when loading', () => {
      const wrapper = mountWithPaths({ isLoading: true })
      expect(wrapper.find('#repository-path').attributes('disabled')).toBeDefined()
    })

    it('should disable submit button when loading', () => {
      const wrapper = mountWithPaths({ isLoading: true })
      expect(wrapper.find('.settings-snapshots-setup__submit').attributes('disabled')).toBeDefined()
    })

    it('should not disable submit button when path is selected', () => {
      const wrapper = mountWithPaths()
      expect(wrapper.find('.settings-snapshots-setup__submit').attributes('disabled')).toBeUndefined()
    })
  })
})
