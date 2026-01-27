import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSnapshots, DEFAULT_REPOSITORY } from '@/composables/useSnapshots'
import { SNAPSHOT_STATUS } from '@/enums/snapshotStatus'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getSnapshotRepositories: vi.fn(),
      getSnapshotRepository: vi.fn(),
      createSnapshotRepository: vi.fn(),
      deleteSnapshotRepository: vi.fn(),
      getSnapshots: vi.fn(),
      getSnapshot: vi.fn(),
      createSnapshot: vi.fn(),
      deleteSnapshot: vi.fn(),
      restoreSnapshot: vi.fn(),
      closeIndex: vi.fn(),
      openIndex: vi.fn(),
      getClusterNodesSettings: vi.fn()
    }
  }
})

describe('useSnapshots composable', () => {
  let plugins

  beforeEach(() => {
    setActivePinia(createPinia())
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  function mountComposable() {
    const TestComponent = {
      setup() {
        return useSnapshots()
      },
      template: '<div></div>'
    }
    return mount(TestComponent, { global: { plugins } })
  }

  describe('DEFAULT_REPOSITORY', () => {
    it('should export default repository name', () => {
      expect(DEFAULT_REPOSITORY).toBe('datashare_backup')
    })
  })

  describe('fetchSnapshots', () => {
    it('should fetch snapshots and update state', async () => {
      const mockSnapshots = [
        { snapshot: 'snapshot-1', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z' },
        { snapshot: 'snapshot-2', state: 'SUCCESS', start_time: '2024-01-02T00:00:00Z' }
      ]
      api.getSnapshots.mockResolvedValue({ snapshots: mockSnapshots })

      const wrapper = mountComposable()
      await wrapper.vm.fetchSnapshots()
      await flushPromises()

      expect(api.getSnapshots).toHaveBeenCalledTimes(1)
      expect(api.getSnapshots).toHaveBeenCalledWith(DEFAULT_REPOSITORY)
      expect(wrapper.vm.snapshots).toEqual(mockSnapshots)
    })

    it('should handle empty snapshots', async () => {
      api.getSnapshots.mockResolvedValue({ snapshots: [] })

      const wrapper = mountComposable()
      await wrapper.vm.fetchSnapshots()
      await flushPromises()

      expect(wrapper.vm.snapshots).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      api.getSnapshots.mockRejectedValue(new Error('API Error'))

      const wrapper = mountComposable()
      await wrapper.vm.fetchSnapshots()
      await flushPromises()

      expect(wrapper.vm.snapshots).toEqual([])
    })
  })

  describe('sortedSnapshots', () => {
    it('should return snapshots sorted by date descending', async () => {
      const mockSnapshots = [
        { snapshot: 'old', state: 'SUCCESS', start_time: '2024-01-01T00:00:00Z' },
        { snapshot: 'new', state: 'SUCCESS', start_time: '2024-01-03T00:00:00Z' },
        { snapshot: 'middle', state: 'SUCCESS', start_time: '2024-01-02T00:00:00Z' }
      ]
      api.getSnapshots.mockResolvedValue({ snapshots: mockSnapshots })

      const wrapper = mountComposable()
      await wrapper.vm.fetchSnapshots()
      await flushPromises()

      expect(wrapper.vm.sortedSnapshots[0].snapshot).toBe('new')
      expect(wrapper.vm.sortedSnapshots[1].snapshot).toBe('middle')
      expect(wrapper.vm.sortedSnapshots[2].snapshot).toBe('old')
    })
  })

  describe('hasInProgress', () => {
    it('should return true when there are in-progress snapshots', async () => {
      const mockSnapshots = [
        { snapshot: 'snapshot-1', state: SNAPSHOT_STATUS.IN_PROGRESS }
      ]
      api.getSnapshots.mockResolvedValue({ snapshots: mockSnapshots })

      const wrapper = mountComposable()
      await wrapper.vm.fetchSnapshots()
      await flushPromises()

      expect(wrapper.vm.hasInProgress).toBe(true)
    })

    it('should return false when no in-progress snapshots', async () => {
      const mockSnapshots = [
        { snapshot: 'snapshot-1', state: SNAPSHOT_STATUS.SUCCESS }
      ]
      api.getSnapshots.mockResolvedValue({ snapshots: mockSnapshots })

      const wrapper = mountComposable()
      await wrapper.vm.fetchSnapshots()
      await flushPromises()

      expect(wrapper.vm.hasInProgress).toBe(false)
    })
  })

  describe('createSnapshot', () => {
    it('should call API to create snapshot with repository', async () => {
      api.createSnapshot.mockResolvedValue({})
      api.getSnapshots.mockResolvedValue({ snapshots: [] })

      const wrapper = mountComposable()
      await wrapper.vm.createSnapshot()
      await flushPromises()

      expect(api.createSnapshot).toHaveBeenCalledTimes(1)
      expect(api.createSnapshot).toHaveBeenCalledWith(
        DEFAULT_REPOSITORY,
        expect.stringMatching(/^snapshot-\d{13}$/)
      )
    })
  })

  describe('deleteSnapshot', () => {
    it('should call API to delete snapshot and refresh list', async () => {
      api.deleteSnapshot.mockResolvedValue({})
      api.getSnapshots.mockResolvedValue({ snapshots: [] })

      const wrapper = mountComposable()
      await wrapper.vm.deleteSnapshot('snapshot-1')
      await flushPromises()

      expect(api.deleteSnapshot).toHaveBeenCalledWith(DEFAULT_REPOSITORY, 'snapshot-1')
      expect(api.getSnapshots).toHaveBeenCalled()
    })
  })

  describe('restoreSnapshot', () => {
    it('should close indices, restore snapshot, and reopen indices', async () => {
      const mockSnapshots = [
        { snapshot: 'snapshot-1', state: 'SUCCESS', indices: ['index1', 'index2'] }
      ]
      api.getSnapshots.mockResolvedValue({ snapshots: mockSnapshots })
      api.closeIndex.mockResolvedValue({})
      api.restoreSnapshot.mockResolvedValue({})
      api.openIndex.mockResolvedValue({})

      const wrapper = mountComposable()
      await wrapper.vm.fetchSnapshots()
      await flushPromises()

      await wrapper.vm.restoreSnapshot('snapshot-1')
      await flushPromises()

      // Should close all indices at once
      expect(api.closeIndex).toHaveBeenCalledWith('index1,index2')

      // Should restore snapshot
      expect(api.restoreSnapshot).toHaveBeenCalledWith(DEFAULT_REPOSITORY, 'snapshot-1')

      // Should reopen all indices at once
      expect(api.openIndex).toHaveBeenCalledWith('index1,index2')
    })

    it('should still reopen indices if restore fails', async () => {
      const mockSnapshots = [
        { snapshot: 'snapshot-1', state: 'SUCCESS', indices: ['index1'] }
      ]
      api.getSnapshots.mockResolvedValue({ snapshots: mockSnapshots })
      api.closeIndex.mockResolvedValue({})
      api.restoreSnapshot.mockRejectedValue(new Error('Restore failed'))
      api.openIndex.mockResolvedValue({})

      const wrapper = mountComposable()
      await wrapper.vm.fetchSnapshots()
      await flushPromises()

      try {
        await wrapper.vm.restoreSnapshot('snapshot-1')
      }
      catch {
        // Expected to fail
      }
      await flushPromises()

      // Should still reopen indices even if restore failed
      expect(api.openIndex).toHaveBeenCalledWith('index1')
    })

    it('should handle missing snapshot gracefully', async () => {
      api.getSnapshots.mockResolvedValue({ snapshots: [] })
      api.restoreSnapshot.mockResolvedValue({})

      const wrapper = mountComposable()
      await wrapper.vm.fetchSnapshots()
      await flushPromises()

      await wrapper.vm.restoreSnapshot('nonexistent')
      await flushPromises()

      // Should not call close/open but still call restore
      expect(api.closeIndex).not.toHaveBeenCalled()
      expect(api.restoreSnapshot).toHaveBeenCalledWith(DEFAULT_REPOSITORY, 'nonexistent')
      expect(api.openIndex).not.toHaveBeenCalled()
    })
  })

  describe('fetchRepositories', () => {
    it('should fetch all repositories', async () => {
      api.getSnapshotRepositories.mockResolvedValue({
        datashare_backup: { type: 'fs' },
        other_repo: { type: 'fs' }
      })

      const wrapper = mountComposable()
      const repos = await wrapper.vm.fetchRepositories()
      await flushPromises()

      expect(repos).toEqual(['datashare_backup', 'other_repo'])
      expect(wrapper.vm.repositories).toEqual(['datashare_backup', 'other_repo'])
    })

    it('should handle fetch repositories error', async () => {
      api.getSnapshotRepositories.mockRejectedValue(new Error('Failed'))

      const wrapper = mountComposable()
      const repos = await wrapper.vm.fetchRepositories()
      await flushPromises()

      expect(repos).toEqual([])
      expect(wrapper.vm.repositories).toEqual([])
    })
  })

  describe('fetchRepository', () => {
    it('should fetch repository config', async () => {
      const mockConfig = {
        datashare_backup: {
          type: 'fs',
          settings: { location: '/backups' }
        }
      }
      api.getSnapshotRepository.mockResolvedValue(mockConfig)

      const wrapper = mountComposable()
      await wrapper.vm.fetchRepository()
      await flushPromises()

      expect(api.getSnapshotRepository).toHaveBeenCalledWith(DEFAULT_REPOSITORY)
      expect(wrapper.vm.repositoryConfig).toEqual(mockConfig.datashare_backup)
      expect(wrapper.vm.hasRepository).toBe(true)
      expect(wrapper.vm.repositoryError).toBeNull()
    })

    it('should handle repository fetch error', async () => {
      api.getSnapshotRepository.mockRejectedValue(new Error('Not found'))

      const wrapper = mountComposable()
      await wrapper.vm.fetchRepository()
      await flushPromises()

      expect(wrapper.vm.repositoryConfig).toBeNull()
      expect(wrapper.vm.hasRepository).toBe(false)
      expect(wrapper.vm.repositoryError).toBe('Not found')
    })
  })

  describe('createRepository', () => {
    it('should create repository with path', async () => {
      api.createSnapshotRepository.mockResolvedValue({})
      api.getSnapshotRepository.mockResolvedValue({
        datashare_backup: { type: 'fs', settings: { location: '/backups' } }
      })

      const wrapper = mountComposable()
      await wrapper.vm.createRepository('/backups')
      await flushPromises()

      expect(api.createSnapshotRepository).toHaveBeenCalledWith(DEFAULT_REPOSITORY, {
        type: 'fs',
        settings: { location: '/backups' }
      })
      expect(api.getSnapshotRepository).toHaveBeenCalled()
    })
  })

  describe('deleteRepository', () => {
    it('should delete repository and clear state', async () => {
      api.deleteSnapshotRepository.mockResolvedValue({})

      const wrapper = mountComposable()
      // First set up some state
      wrapper.vm.repositoryConfig = { type: 'fs' }
      wrapper.vm.snapshots = [{ snapshot: 'test' }]

      await wrapper.vm.deleteRepository()
      await flushPromises()

      expect(api.deleteSnapshotRepository).toHaveBeenCalledWith(DEFAULT_REPOSITORY)
      expect(wrapper.vm.repositoryConfig).toBeNull()
      expect(wrapper.vm.snapshots).toEqual([])
      expect(wrapper.vm.hasRepository).toBe(false)
    })
  })

  describe('fetchAvailablePaths', () => {
    it('should fetch available paths from cluster settings', async () => {
      api.getClusterNodesSettings.mockResolvedValue({
        nodes: {
          nodeId1: {
            settings: {
              path: {
                repo: ['/backup/path1', '/backup/path2']
              }
            }
          }
        }
      })

      const wrapper = mountComposable()
      await wrapper.vm.fetchAvailablePaths()
      await flushPromises()

      expect(api.getClusterNodesSettings).toHaveBeenCalled()
      expect(wrapper.vm.availablePaths).toEqual(['/backup/path1', '/backup/path2'])
      expect(wrapper.vm.pathsLoaded).toBe(true)
    })

    it('should handle single path as string', async () => {
      api.getClusterNodesSettings.mockResolvedValue({
        nodes: {
          nodeId1: {
            settings: {
              path: {
                repo: '/backup/single'
              }
            }
          }
        }
      })

      const wrapper = mountComposable()
      await wrapper.vm.fetchAvailablePaths()
      await flushPromises()

      expect(wrapper.vm.availablePaths).toEqual(['/backup/single'])
      expect(wrapper.vm.pathsLoaded).toBe(true)
    })

    it('should handle missing path.repo', async () => {
      api.getClusterNodesSettings.mockResolvedValue({
        nodes: {
          nodeId1: {
            settings: {
              path: {}
            }
          }
        }
      })

      const wrapper = mountComposable()
      await wrapper.vm.fetchAvailablePaths()
      await flushPromises()

      expect(wrapper.vm.availablePaths).toEqual([])
      expect(wrapper.vm.pathsLoaded).toBe(true)
    })

    it('should handle empty nodes', async () => {
      api.getClusterNodesSettings.mockResolvedValue({
        nodes: {}
      })

      const wrapper = mountComposable()
      await wrapper.vm.fetchAvailablePaths()
      await flushPromises()

      expect(wrapper.vm.availablePaths).toEqual([])
      expect(wrapper.vm.pathsLoaded).toBe(true)
    })

    it('should handle API errors gracefully', async () => {
      api.getClusterNodesSettings.mockRejectedValue(new Error('API Error'))

      const wrapper = mountComposable()
      await wrapper.vm.fetchAvailablePaths()
      await flushPromises()

      expect(wrapper.vm.availablePaths).toEqual([])
      expect(wrapper.vm.pathsLoaded).toBe(true)
    })
  })

  describe('hasAvailablePaths', () => {
    it('should return true when paths are available', async () => {
      api.getClusterNodesSettings.mockResolvedValue({
        nodes: {
          nodeId1: {
            settings: { path: { repo: ['/backup'] } }
          }
        }
      })

      const wrapper = mountComposable()
      await wrapper.vm.fetchAvailablePaths()
      await flushPromises()

      expect(wrapper.vm.hasAvailablePaths).toBe(true)
    })

    it('should return false when no paths are available', async () => {
      api.getClusterNodesSettings.mockResolvedValue({ nodes: {} })

      const wrapper = mountComposable()
      await wrapper.vm.fetchAvailablePaths()
      await flushPromises()

      expect(wrapper.vm.hasAvailablePaths).toBe(false)
    })
  })

  describe('hasSinglePath', () => {
    it('should return true when exactly one path is available', async () => {
      api.getClusterNodesSettings.mockResolvedValue({
        nodes: {
          nodeId1: {
            settings: { path: { repo: ['/backup'] } }
          }
        }
      })

      const wrapper = mountComposable()
      await wrapper.vm.fetchAvailablePaths()
      await flushPromises()

      expect(wrapper.vm.hasSinglePath).toBe(true)
    })

    it('should return false when multiple paths are available', async () => {
      api.getClusterNodesSettings.mockResolvedValue({
        nodes: {
          nodeId1: {
            settings: { path: { repo: ['/backup1', '/backup2'] } }
          }
        }
      })

      const wrapper = mountComposable()
      await wrapper.vm.fetchAvailablePaths()
      await flushPromises()

      expect(wrapper.vm.hasSinglePath).toBe(false)
    })

    it('should return false when no paths are available', async () => {
      api.getClusterNodesSettings.mockResolvedValue({ nodes: {} })

      const wrapper = mountComposable()
      await wrapper.vm.fetchAvailablePaths()
      await flushPromises()

      expect(wrapper.vm.hasSinglePath).toBe(false)
    })
  })
})
