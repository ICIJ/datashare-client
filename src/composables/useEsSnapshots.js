import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { castArray, random } from 'lodash'

import { useCore } from '@/composables/useCore'
import { usePolling } from '@/composables/usePolling'
import { useWait } from '@/composables/useWait'
import { useToast } from '@/composables/useToast'
import { SNAPSHOT_STATUS } from '@/enums/snapshotStatus'
import { ES_SNAPSHOT_REPOSITORY_TYPE, ES_SNAPSHOT_DEFAULT_REPOSITORY } from '@/enums/esSnapshots'
import { formatSnapshotName } from '@/utils/esSnapshots'

const getFirstNodeSettings = nodes => nodes[Object.keys(nodes)[0]]?.settings
const extractPathRepo = data => castArray(getFirstNodeSettings(data?.nodes || {})?.path?.repo ?? [])
const sortByDateDesc = (a, b) => new Date(b.start_time) - new Date(a.start_time)

export function useEsSnapshots(repositoryName = ES_SNAPSHOT_DEFAULT_REPOSITORY) {
  const { api } = useCore()
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

  const hasInProgress = computed(() => snapshots.value.some(s => s.state === SNAPSHOT_STATUS.IN_PROGRESS))
  const sortedSnapshots = computed(() => [...snapshots.value].sort(sortByDateDesc))
  const hasRepository = computed(() => repositoryConfig.value !== null)
  const hasAvailablePaths = computed(() => availablePaths.value.length > 0)
  const hasSinglePath = computed(() => availablePaths.value.length === 1)

  const toastRepositoryCreated = {
    successMessage: t('settings.snapshots.success.repositoryCreated'),
    errorMessage: err => t('settings.snapshots.error.repository', { error: err.message })
  }

  const toastRepositoryDeleted = {
    successMessage: t('settings.snapshots.success.repositoryDeleted'),
    errorMessage: err => t('settings.snapshots.error.repositoryDelete', { error: err.message })
  }

  const toastSnapshotCreated = {
    successMessage: t('settings.snapshots.success.create'),
    errorMessage: err => t('settings.snapshots.error.create', { error: err.message })
  }

  const toastSnapshotDeleted = {
    successMessage: t('settings.snapshots.success.delete'),
    errorMessage: err => t('settings.snapshots.error.delete', { error: err.message })
  }

  const toastSnapshotRestored = {
    successMessage: t('settings.snapshots.success.restore'),
    errorMessage: err => t('settings.snapshots.error.restore', { error: err.message })
  }

  async function fetchAvailablePaths() {
    try {
      const data = await api.getClusterNodesSettings()
      availablePaths.value = extractPathRepo(data)
    }
    catch {
      availablePaths.value = []
    }
    finally {
      pathsLoaded.value = true
    }
  }

  async function fetchRepositories() {
    try {
      const data = await api.getSnapshotRepositories()
      repositories.value = Object.keys(data || {})
    }
    catch {
      repositories.value = []
    }
    return repositories.value
  }

  async function fetchRepository() {
    try {
      const data = await api.getSnapshotRepository(repository.value)
      repositoryConfig.value = data?.[repository.value] || null
      repositoryError.value = null
    }
    catch (error) {
      repositoryConfig.value = null
      repositoryError.value = error.message
    }
  }

  async function fetchSnapshots() {
    try {
      const data = await api.getSnapshots(repository.value)
      snapshots.value = data?.snapshots || []
      return hasInProgress.value
    }
    catch {
      snapshots.value = []
      return false
    }
  }

  const fetchSnapshotsWithLoading = waitFor(fetchSnapshots)

  async function createRepository(path, type = ES_SNAPSHOT_REPOSITORY_TYPE.FS) {
    const config = { type, settings: { location: path } }
    const promise = api.createSnapshotRepository(repository.value, config)
    await toastedPromise(promise, toastRepositoryCreated)
    await fetchRepository()
  }

  async function deleteRepository() {
    const promise = api.deleteSnapshotRepository(repository.value)
    await toastedPromise(promise, toastRepositoryDeleted)
    repositoryConfig.value = null
    snapshots.value = []
  }

  async function fetchElasticsearchInfo() {
    try {
      const data = await api.getElasticsearchInfo()
      return {
        version: data?.version?.number || null,
        distribution: data?.version?.distribution || null
      }
    }
    catch {
      return { version: null, distribution: null }
    }
  }

  async function createSnapshot() {
    const { version, distribution } = await fetchElasticsearchInfo()
    const snapshotName = formatSnapshotName(version, distribution)
    const promise = api.createSnapshot(repository.value, snapshotName)
    await toastedPromise(promise, toastSnapshotCreated)
    startPolling()
  }

  async function deleteSnapshot(snapshotName) {
    const promise = api.deleteSnapshot(repository.value, snapshotName)
    await toastedPromise(promise, toastSnapshotDeleted)
    await fetchSnapshots()
  }

  const getSnapshotByName = name => snapshots.value.find(s => s.snapshot === name)
  const getSnapshotIndices = name => getSnapshotByName(name)?.indices || []

  async function closeIndices(indices) {
    if (indices.length === 0) return
    const indicesList = indices.join(',')
    try {
      await api.closeIndex(indicesList)
    }
    catch {
      // Indices might not exist, continue
    }
  }

  async function openIndices(indices) {
    if (indices.length === 0) return
    const indicesList = indices.join(',')
    try {
      await api.openIndex(indicesList)
    }
    catch {
      // Indices might not exist yet, continue
    }
  }

  async function restoreSnapshot(snapshotName) {
    const indices = getSnapshotIndices(snapshotName)
    await closeIndices(indices)
    try {
      const promise = api.restoreSnapshot(repository.value, snapshotName)
      await toastedPromise(promise, toastSnapshotRestored)
    }
    finally {
      await openIndices(indices)
    }
  }

  async function startPolling() {
    await fetchSnapshotsWithLoading()
    const fn = fetchSnapshots
    const timeout = () => random(2000, 4000)
    return registerPollOnce({ fn, timeout })
  }

  const stopPolling = () => unregisteredPoll({ fn: fetchSnapshots })

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
    fetchSnapshots,
    fetchSnapshotsWithLoading,
    createRepository,
    deleteRepository,
    createSnapshot,
    deleteSnapshot,
    restoreSnapshot,
    getSnapshotByName,
    startPolling,
    stopPolling
  }
}
