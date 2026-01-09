import { useConfig } from '@/composables/useConfig.js'
import { computed } from 'vue'
import { camelCase, find, upperFirst } from 'lodash'

const DEFAULT_ROLE = 'VIEWER'
export function usePolicies() {
  const config = useConfig()
  const userPolicies = computed(() => config.get('policies', []))
  function getRolesByProject(projectName) {
    return find(userPolicies.value, p => p.projectId === projectName)?.roles ?? [DEFAULT_ROLE]
  }
  function formatRole(role) {
    return upperFirst(camelCase(role))
  }
  function formatRoles(roles) {
    return roles.map(formatRole).join(', ')
  }
  return { getRolesByProject, formatRole, formatRoles }
}
