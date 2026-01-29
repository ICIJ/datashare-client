import { useConfig } from '@/composables/useConfig.js'
import { computed } from 'vue'
import { camelCase, find, upperFirst } from 'lodash'
import {DEFAULT_ROLE, ROLE_KEY} from '@/enums/roles.js'

export function usePolicies() {
  const config = useConfig()
  const userPolicies = computed(() => config.get('policies', []))

  function getRolesByProject(projectId) {
    return getPolicyByProject(projectId)?.roles ?? [DEFAULT_ROLE]
  }
  function getPolicyByProject(projectId) {
    return find(userPolicies.value, { projectId })
  }

  function formatRole(t,role) {
    return upperFirst(camelCase(t(ROLE_KEY[role] ?? DEFAULT_ROLE)))
  }

  function formatRoles(t,roles) {
    return roles.map(r=>formatRole(t,r)).join(', ')
  }

  function isProjectAdmin(projectName) {
    return getPolicyByProject(projectName)?.admin === true
  }

  return { getRolesByProject, formatRole, formatRoles, isProjectAdmin }
}
