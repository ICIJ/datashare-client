import { useConfig } from '@/composables/useConfig.js'
import { computed } from 'vue'
import { upperFirst } from 'lodash'
import { DEFAULT_ROLE, ROLE, ROLE_BIT, ROLE_HIERARCHY, ROLE_KEY } from '@/enums/roles.js'

export function usePolicies() {
  const config = useConfig()
  const policies = computed(() => config.get('policies', []))

  function hasRole(userRole, minimumRole) {
    return (ROLE_HIERARCHY[userRole] & ROLE_BIT[minimumRole]) !== 0
  }

  function resolveHighestRole(filtered) {
    if (!filtered?.length) return DEFAULT_ROLE
    // OR all individual role bits to get a combined capability mask
    const combined = filtered.reduce((bits, { role }) => bits | (ROLE_BIT[role] ?? 0), 0)
    if (!combined) return DEFAULT_ROLE
    // Find highest set bit position via hardware-level count-leading-zeros
    const highestBit = 31 - Math.clz32(combined)
    // Map bit position back to role name
    return Object.keys(ROLE_BIT).find(role => ROLE_BIT[role] === (1 << highestBit)) ?? DEFAULT_ROLE
  }

  function getHighestRoleFromList(policyList) {
    return resolveHighestRole(policyList)
  }

  function getHighestRoleFromListForDomain(policyList, domainId) {
    const filtered = policyList?.filter(p => p.domainId === domainId || p.domainId === '*')
    return resolveHighestRole(filtered)
  }

  function getHighestRoleFromListForProject(policyList, domainId, projectId) {
    const filtered = policyList?.filter(p =>
      (p.domainId === domainId || p.domainId === '*')
      && (p.projectId === projectId || p.projectId === '*')
    )
    return resolveHighestRole(filtered)
  }

  function getRoleByProject(projectId, domainId = null) {
    return domainId
      ? getHighestRoleFromListForProject(policies.value, domainId, projectId)
      : getHighestRoleFromList(policies.value.filter(p => p.projectId === projectId || p.projectId === '*'))
  }

  function isProjectAdmin(projectName) {
    return hasRole(getRoleByProject(projectName), ROLE.PROJECT_ADMIN)
  }

  function formatRole(t, role) {
    return upperFirst(t(ROLE_KEY[role] ?? DEFAULT_ROLE))
  }

  return { getRoleByProject, getHighestRoleFromList, getHighestRoleFromListForDomain, getHighestRoleFromListForProject, formatRole, isProjectAdmin, hasRole }
}
