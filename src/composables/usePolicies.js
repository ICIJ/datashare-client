import { useConfig } from '@/composables/useConfig.js'
import { computed } from 'vue'
import { camelCase, find, upperFirst } from 'lodash'
import {DEFAULT_ROLE, ROLE, ROLE_BIT, ROLE_HIERARCHY, ROLE_KEY} from '@/enums/roles.js'

export function usePolicies() {
  const config = useConfig()
  const policies = computed(() => config.get('policies', []))

  function hasRole(userRole, minimumRole) {
    return (ROLE_HIERARCHY[userRole] & ROLE_BIT[minimumRole]) !== 0
  }

  function getRoleByProject(projectId) {
    return getPolicyByProject(projectId)?.role ?? DEFAULT_ROLE
  }
  function getPolicyByProject(projectId) {
    return find(policies.value, { projectId })
  }

  function formatRole(t, role) {
    return upperFirst(camelCase(t(ROLE_KEY[role] ?? DEFAULT_ROLE)))
  }

  function isProjectAdmin(projectName) {
    return getPolicyByProject(projectName)?.role === ROLE.PROJECT_ADMIN
  }

  return { getRoleByProject, formatRole, isProjectAdmin, hasRole }
}
