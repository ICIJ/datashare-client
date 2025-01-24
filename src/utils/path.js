import { computed } from 'vue'

import { useCore } from '@/composables/core'

export function usePath() {
  const { core } = useCore()

  const defaultProjectName = computed(() => core.config.get('defaultProject'))
  const defaultProject = computed(() => core.findProject(defaultProjectName.value))
  const defaultDataDir = computed(() => core.config.get('mountedDataDir') || core.config.get('dataDir'))
  function getProjectSourcePath(project) {
    const currentSourcePath = project.value?.sourcePath?.split('file://').pop() ?? defaultDataDir.value
    return decodeURI(currentSourcePath)
  }
  return { defaultProjectName, defaultProject, defaultDataDir, getProjectSourcePath }
}
