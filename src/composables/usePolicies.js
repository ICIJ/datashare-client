import { useConfig } from '@/composables/useConfig.js'
import { computed } from 'vue'
import { find } from 'lodash'

const DEFAULT_ROLE = 'VIEWER'
export function usePolicies() {
  const config = useConfig()
  const userPolicies = computed(() => config.get('policies', []))
  function getRolesByProject(projectName) {
    return find(userPolicies.value, p => p.projectId === projectName)?.roles ?? [DEFAULT_ROLE]
  }
  return { getRolesByProject }
}
