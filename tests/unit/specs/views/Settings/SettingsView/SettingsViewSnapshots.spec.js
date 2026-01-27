import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsViewSnapshots from '@/views/Settings/SettingsView/SettingsViewSnapshots'
import { MODE_NAME } from '@/mode'
import { apiInstance as api } from '@/api/apiInstance'
import { ES_SNAPSHOT_DEFAULT_REPOSITORY } from '@/enums/esSnapshots'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getSnapshotRepositories: vi.fn(),
      getSnapshotRepository: vi.fn(),
      createSnapshotRepository: vi.fn(),
      getSnapshots: vi.fn(),
      getSnapshot: vi.fn(),
      createSnapshot: vi.fn(),
      deleteSnapshot: vi.fn(),
      restoreSnapshot: vi.fn()
    }
  }
})

describe('SettingsViewSnapshots', () => {
  let plugins

  beforeEach(async () => {
    api.getSnapshots.mockResolvedValue({ snapshots: [] })
    api.getSnapshotRepository.mockResolvedValue({
      [ES_SNAPSHOT_DEFAULT_REPOSITORY]: { type: 'fs', settings: { location: '/backups' } }
    })
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
    core.config.merge({ mode: MODE_NAME.LOCAL })
  })

  afterEach(async () => {
    await flushPromises()
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should render the snapshots settings view', () => {
    const wrapper = mount(SettingsViewSnapshots, { global: { plugins } })
    expect(wrapper.find('.settings-view-snapshots').exists()).toBeTruthy()
  })

  it('should display the settings snapshots component', () => {
    const wrapper = mount(SettingsViewSnapshots, { global: { plugins } })
    expect(wrapper.findComponent({ name: 'SettingsSnapshots' }).exists()).toBeTruthy()
  })

  it('should fetch repository on mount', async () => {
    mount(SettingsViewSnapshots, { global: { plugins } })
    await flushPromises()
    expect(api.getSnapshotRepository).toHaveBeenCalledWith(ES_SNAPSHOT_DEFAULT_REPOSITORY)
  })

  it('should fetch snapshots when repository exists', async () => {
    mount(SettingsViewSnapshots, { global: { plugins } })
    await flushPromises()
    expect(api.getSnapshots).toHaveBeenCalledWith(ES_SNAPSHOT_DEFAULT_REPOSITORY)
  })

  it('should display snapshots when available', async () => {
    const mockSnapshots = [
      { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z', indices: ['index1'] }
    ]
    api.getSnapshots.mockResolvedValue({ snapshots: mockSnapshots })

    const wrapper = mount(SettingsViewSnapshots, { global: { plugins } })
    await flushPromises()

    expect(wrapper.text()).toContain('snapshot-1')
  })

  it('should display empty state when no snapshots', async () => {
    api.getSnapshots.mockResolvedValue({ snapshots: [] })

    const wrapper = mount(SettingsViewSnapshots, { global: { plugins } })
    await flushPromises()

    expect(wrapper.find('.settings-snapshots-list__empty').exists()).toBeTruthy()
  })

  it('should display setup when repository does not exist', async () => {
    api.getSnapshotRepository.mockRejectedValue(new Error('Not found'))

    const wrapper = mount(SettingsViewSnapshots, { global: { plugins } })
    await flushPromises()

    expect(wrapper.findComponent({ name: 'SettingsSnapshotsSetup' }).exists()).toBeTruthy()
  })

  it('should not fetch snapshots when repository does not exist', async () => {
    api.getSnapshotRepository.mockRejectedValue(new Error('Not found'))

    mount(SettingsViewSnapshots, { global: { plugins } })
    await flushPromises()

    expect(api.getSnapshots).not.toHaveBeenCalled()
  })
})
