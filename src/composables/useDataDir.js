import { computed } from 'vue'

import { useCore } from '@/composables/useCore'

export function useDataDir() {
  const { core } = useCore()
  // The data dir is the actualy data directory used by Datashare
  const dataDir = computed(() => core.getDefaultDataDir())
  // The mounted data dir is the data directory as seen outside of a Docker containers. In 
  // other words, it is the path that the data dir is mounted to and therefore, the one
  // that should be displayed to the end user.
  const mountedDataDir = computed(() => core.getMountedDataDir())

  /**
   * The mounted path corresponding to a given internal path.
   *
   * @param {string} path - The internal path.
   * @returns {string} - The mounted path.
   */
  function getMountedPath(path) {
    if (dataDir.value !== mountedDataDir.value && path.startsWith(dataDir.value)) {
      // The .replace function here is safe because we have already checked that the path starts with dataDir
      // and this function only replaces the first occurrence (which is the only one that matters here).
      return path.replace(dataDir.value, mountedDataDir.value)
    }
    return path
  }

  return { dataDir, mountedDataDir, getMountedPath }
}
