import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsSnapshotsList from '@/components/Settings/SettingsSnapshots/SettingsSnapshotsList'

describe('SettingsSnapshotsList', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComponent(props = {}) {
    return mount(SettingsSnapshotsList, {
      global: { plugins },
      props: {
        snapshots: [],
        isLoading: false,
        ...props
      }
    })
  }

  it('should render the list component', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.settings-snapshots-list').exists()).toBeTruthy()
  })

  it('should display loading spinner when loading and no snapshots', () => {
    const wrapper = mountComponent({ isLoading: true, snapshots: [] })
    expect(wrapper.find('.settings-snapshots-list__loading').exists()).toBeTruthy()
    expect(wrapper.findComponent({ name: 'BSpinner' }).exists()).toBeTruthy()
  })

  it('should display empty state when no snapshots and not loading', () => {
    const wrapper = mountComponent({ snapshots: [], isLoading: false })
    expect(wrapper.find('.settings-snapshots-list__empty').exists()).toBeTruthy()
  })

  it('should display table when snapshots exist', () => {
    const snapshots = [
      { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] }
    ]
    const wrapper = mountComponent({ snapshots })
    expect(wrapper.find('.settings-snapshots-list__table').exists()).toBeTruthy()
  })

  it('should render actions for each snapshot', () => {
    const snapshots = [
      { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] },
      { snapshot: 'snapshot-2', state: 'IN_PROGRESS', start_time: '2024-01-02T00:00:00Z', indices: ['index2'] }
    ]
    const wrapper = mountComponent({ snapshots })
    const actions = wrapper.findAllComponents({ name: 'SettingsSnapshotsActions' })
    expect(actions).toHaveLength(2)
  })

  it('should emit delete event from actions', async () => {
    const snapshots = [
      { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] }
    ]
    const wrapper = mountComponent({ snapshots })
    const actions = wrapper.findComponent({ name: 'SettingsSnapshotsActions' })
    actions.vm.$emit('delete', 'snapshot-1')
    expect(wrapper.emitted('delete')).toEqual([['snapshot-1']])
  })

  it('should emit restore event from actions', async () => {
    const snapshots = [
      { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] }
    ]
    const wrapper = mountComponent({ snapshots })
    const actions = wrapper.findComponent({ name: 'SettingsSnapshotsActions' })
    actions.vm.$emit('restore', 'snapshot-1')
    expect(wrapper.emitted('restore')).toEqual([['snapshot-1']])
  })

  it('should display table headers', () => {
    const snapshots = [
      { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] }
    ]
    const wrapper = mountComponent({ snapshots })
    const headers = wrapper.findAllComponents({ name: 'PageTableTh' })
    expect(headers).toHaveLength(6) // Status, Name, Date, Version, Distribution, Projects
  })
})
