import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/useCore'
import { usePolling } from '@/composables/usePolling'
import { useWait } from '@/composables/useWait'
import { useToast } from '@/composables/useToast'

export const SNAPSHOT_STATUS = Object.freeze({
  SUCCESS: 'SUCCESS',
  IN_PROGRESS: 'IN_PROGRESS',
  FAILED: 'FAILED',
  PARTIAL: 'PARTIAL'
})

export const DEFAULT_REPOSITORY = 'datashare_backup'

function formatSnapshotName(date) {
  return `snapshot-${date.getTime()}`
}

export function useSnapshots(repositoryName = DEFAULT_REPOSITORY) {
  const core = useCore()
  const { registerPollOnce, unregisteredPoll } = usePolling()
  const { waitFor, loaderId, isLoading } = useWait()
  const { toastedPromise } = useToast()
  const { t } = useI18n()

  const snapshots = ref([])
  const repositories = ref([])
  const repository = ref(repositoryName)
  const repositoryConfig = ref(null)
  const repositoryError = ref(null)
  const availablePaths = ref([])
  const pathsLoaded = ref(false)

  const hasInProgress = computed(() =>
    snapshots.value.some(s => s.state === SNAPSHOT_STATUS.IN_PROGRESS)
  )

  const sortedSnapshots = computed(() =>
    [...snapshots.value].sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
  )

  const hasRepository = computed(() => repositoryConfig.value !== null)
  const hasAvailablePaths = computed(() => availablePaths.value.length > 0)
  const hasSinglePath = computed(() => availablePaths.value.length === 1)

  // Fetch available paths from cluster settings (path.repo)
  async function fetchAvailablePaths() {
    try {
      const data = await core.api.getClusterNodesSettings()
      // Extract path.repo from nodes settings
      // The response structure is: { nodes: { nodeId: { settings: { path: { repo: [...] } } } } }
      const nodes = data?.nodes || {}
      const nodeIds = Object.keys(nodes)
      if (nodeIds.length > 0) {
        const nodeSettings = nodes[nodeIds[0]]?.settings
        const pathRepo = nodeSettings?.path?.repo
        if (Array.isArray(pathRepo)) {
          availablePaths.value = pathRepo
        }
        else if (typeof pathRepo === 'string') {
          availablePaths.value = [pathRepo]
        }
        else {
          availablePaths.value = []
        }
      }
      else {
        availablePaths.value = []
      }
    }
    catch {
      availablePaths.value = []
    }
    finally {
      pathsLoaded.value = true
    }
  }

  // Fetch all repositories
  async function fetchRepositories() {
    try {
      const data = await core.api.getSnapshotRepositories()
      repositories.value = Object.keys(data || {})
      return repositories.value
    }
    catch {
      repositories.value = []
      return []
    }
  }

  // Fetch repository config
  async function fetchRepository() {
    try {
      const data = await core.api.getSnapshotRepository(repository.value)
      repositoryConfig.value = data?.[repository.value] || null
      repositoryError.value = null
    }
    catch (_error) {
      repositoryConfig.value = null
      repositoryError.value = _error.message
    }
  }

  // Create or update repository
  async function createRepository(path, type = 'fs') {
    const config = {
      type,
      settings: {
        location: path
      }
    }
    await toastedPromise(core.api.createSnapshotRepository(repository.value, config), {
      successMessage: t('settings.snapshots.success.repositoryCreated'),
      errorMessage: err => t('settings.snapshots.error.repository', { error: err.message })
    })
    await fetchRepository()
  }

  // Delete repository
  async function deleteRepository() {
    await toastedPromise(core.api.deleteSnapshotRepository(repository.value), {
      successMessage: t('settings.snapshots.success.repositoryDeleted'),
      errorMessage: err => t('settings.snapshots.error.repositoryDelete', { error: err.message })
    })
    repositoryConfig.value = null
    snapshots.value = []
  }

  async function fetchSnapshots() {
    try {
      const data = await core.api.getSnapshots(repository.value)
      snapshots.value = data?.snapshots || []
      // Return true to continue polling if in-progress
      return hasInProgress.value
    }
    catch {
      // Ignore errors silently (repository might not exist yet)
      snapshots.value = []
      return false
    }
  }

  const fetchSnapshotsWithLoading = waitFor(fetchSnapshots)

  // Create snapshot
  async function createSnapshot() {
    const snapshotName = formatSnapshotName(new Date())
    await toastedPromise(core.api.createSnapshot(repository.value, snapshotName), {
      successMessage: t('settings.snapshots.success.create'),
      errorMessage: err => t('settings.snapshots.error.create', { error: err.message })
    })
    startPolling()
  }

  // Delete snapshot
  async function deleteSnapshot(snapshotName) {
    await toastedPromise(core.api.deleteSnapshot(repository.value, snapshotName), {
      successMessage: t('settings.snapshots.success.delete'),
      errorMessage: err => t('settings.snapshots.error.delete', { error: err.message })
    })
    await fetchSnapshots()
  }

  // Get snapshot by name from the cached list
  function getSnapshotByName(snapshotName) {
    return snapshots.value.find(s => s.snapshot === snapshotName)
  }

  // Restore snapshot (closes indices first, then restores, then reopens)
  async function restoreSnapshot(snapshotName) {
    const snapshot = getSnapshotByName(snapshotName)
    const indices = snapshot?.indices || []

    // Close indices before restore
    for (const index of indices) {
      try {
        await core.api.closeIndex(index)
      }
      catch {
        // Index might not exist, continue
      }
    }

    try {
      // Perform the restore
      await toastedPromise(core.api.restoreSnapshot(repository.value, snapshotName), {
        successMessage: t('settings.snapshots.success.restore'),
        errorMessage: err => t('settings.snapshots.error.restore', { error: err.message })
      })
    }
    finally {
      // Reopen indices after restore (whether it succeeded or failed)
      for (const index of indices) {
        try {
          await core.api.openIndex(index)
        }
        catch {
          // Index might not exist yet, continue
        }
      }
    }
  }

  async function startPolling() {
    await fetchSnapshotsWithLoading()
    return registerPollOnce({
      fn: fetchSnapshots,
      timeout: () => 2000 + Math.random() * 2000,
      immediate: false
    })
  }

  function stopPolling() {
    return unregisteredPoll({ fn: fetchSnapshots })
  }

  return {
    snapshots,
    sortedSnapshots,
    repositories,
    repository,
    repositoryConfig,
    repositoryError,
    availablePaths,
    pathsLoaded,
    hasRepository,
    hasAvailablePaths,
    hasSinglePath,
    hasInProgress,
    isLoading,
    loaderId,
    fetchAvailablePaths,
    fetchRepositories,
    fetchRepository,
    createRepository,
    deleteRepository,
    fetchSnapshots,
    fetchSnapshotsWithLoading,
    createSnapshot,
    deleteSnapshot,
    restoreSnapshot,
    startPolling,
    stopPolling,
    SNAPSHOT_STATUS
  }
}
