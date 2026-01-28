import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsSnapshots from '@/components/Settings/SettingsSnapshots/SettingsSnapshots'

describe('SettingsSnapshots', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComponent(props = {}) {
    return mount(SettingsSnapshots, {
      global: { plugins },
      props: {
        snapshots: [],
        hasRepository: true,
        repositoryConfig: { type: 'fs', settings: { location: '/backups' } },
        isLoading: false,
        ...props
      }
    })
  }

  describe('when repository is configured', () => {
    it('should render the snapshots component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.settings-snapshots').exists()).toBeTruthy()
    })

    it('should display the title', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.settings-snapshots__header__title').exists()).toBeTruthy()
    })

    it('should display the create button', () => {
      const wrapper = mountComponent()
      expect(wrapper.findComponent({ name: 'SettingsSnapshotsCreate' }).exists()).toBeTruthy()
    })

    it('should emit create event when create button is clicked', async () => {
      const wrapper = mountComponent()
      const createButton = wrapper.findComponent({ name: 'SettingsSnapshotsCreate' })
      await createButton.trigger('click')
      expect(wrapper.emitted('create')).toBeTruthy()
    })

    it('should pass snapshots to the list component', () => {
      const snapshots = [
        { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] }
      ]
      const wrapper = mountComponent({ snapshots })
      const list = wrapper.findComponent({ name: 'SettingsSnapshotsList' })
      expect(list.props('snapshots')).toEqual(snapshots)
    })

    it('should pass isLoading to child components', () => {
      const wrapper = mountComponent({ isLoading: true })
      const list = wrapper.findComponent({ name: 'SettingsSnapshotsList' })
      expect(list.props('isLoading')).toBe(true)
    })

    it('should emit delete event from list', async () => {
      const snapshots = [
        { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] }
      ]
      const wrapper = mountComponent({ snapshots })
      const list = wrapper.findComponent({ name: 'SettingsSnapshotsList' })
      list.vm.$emit('delete', 'snapshot-1')
      expect(wrapper.emitted('delete')).toEqual([['snapshot-1']])
    })

    it('should emit restore event from list', async () => {
      const snapshots = [
        { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] }
      ]
      const wrapper = mountComponent({ snapshots })
      const list = wrapper.findComponent({ name: 'SettingsSnapshotsList' })
      list.vm.$emit('restore', 'snapshot-1')
      expect(wrapper.emitted('restore')).toEqual([['snapshot-1']])
    })

    it('should not show setup component when repository exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.findComponent({ name: 'SettingsSnapshotsSetup' }).exists()).toBeFalsy()
    })

    it('should display the delete repository button', () => {
      const wrapper = mountComponent()
      expect(wrapper.findComponent({ name: 'SettingsSnapshotsDeleteRepository' }).exists()).toBeTruthy()
    })

    it('should display repository information when snapshots exist', () => {
      const snapshots = [
        { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] }
      ]
      const wrapper = mountComponent({ snapshots })
      expect(wrapper.find('.settings-snapshots__repository').exists()).toBeTruthy()
    })

    it('should hide repository information when no snapshots', () => {
      const wrapper = mountComponent({ snapshots: [] })
      expect(wrapper.find('.settings-snapshots__repository').exists()).toBeFalsy()
    })

    it('should display repository type', () => {
      const snapshots = [
        { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] }
      ]
      const wrapper = mountComponent({ snapshots })
      expect(wrapper.find('.settings-snapshots__repository__type').exists()).toBeTruthy()
      expect(wrapper.findComponent({ name: 'DisplaySnapshotRepositoryType' }).exists()).toBeTruthy()
    })

    it('should display repository location', () => {
      const snapshots = [
        { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] }
      ]
      const wrapper = mountComponent({ snapshots })
      expect(wrapper.find('.settings-snapshots__repository__location').text()).toBe('/backups')
    })
  })

  describe('when repository is not configured', () => {
    it('should show setup component', () => {
      const wrapper = mountComponent({ hasRepository: false, repositoryConfig: null })
      expect(wrapper.findComponent({ name: 'SettingsSnapshotsSetup' }).exists()).toBeTruthy()
    })

    it('should not show snapshots list', () => {
      const wrapper = mountComponent({ hasRepository: false, repositoryConfig: null })
      expect(wrapper.findComponent({ name: 'SettingsSnapshotsList' }).exists()).toBeFalsy()
    })

    it('should not show create button', () => {
      const wrapper = mountComponent({ hasRepository: false, repositoryConfig: null })
      expect(wrapper.findComponent({ name: 'SettingsSnapshotsCreate' }).exists()).toBeFalsy()
    })

    it('should emit createRepository event from setup', async () => {
      const wrapper = mountComponent({ hasRepository: false, repositoryConfig: null })
      const setup = wrapper.findComponent({ name: 'SettingsSnapshotsSetup' })
      setup.vm.$emit('submit', '/backups')
      expect(wrapper.emitted('createRepository')).toEqual([['/backups']])
    })
  })
})
