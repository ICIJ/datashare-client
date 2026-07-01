import { computed } from 'vue'
import { isArray } from 'lodash'

import { useCore } from '@/composables/useCore'

/**
 * Resolve a model value made of project names to full project objects from the
 * catalog, with an optional fallback to the default project. Shared by every
 * search-context project selector so the resolution lives in one place.
 *
 * @param {import('vue').Ref} modelValue single { name } object or an array of them
 * @param {Object} config
 * @param {Boolean} config.fallbackDefault fall back to the default project when empty
 */
export function useSelectedProjects(modelValue, { fallbackDefault = false } = {}) {
  const core = useCore()

  const projects = computed(() => core.projects)
  const multiple = computed(() => isArray(modelValue.value))

  const selectedProjects = computed({
    get() {
      // Single selection: resolve to the catalog project, or fall back.
      if (!multiple.value) {
        const project = core.findProject(modelValue.value?.name)
        if (fallbackDefault && !project) {
          return { name: core.getDefaultProject() }
        }
        return project ?? null
      }
      // Multiple selection: keep only the names that exist in the catalog.
      const existing = modelValue.value.filter(({ name }) => !!core.findProject(name))
      if (fallbackDefault && !existing.length) {
        return [{ name: core.getDefaultProject() }]
      }
      return existing
    },
    set(value) {
      modelValue.value = value
    }
  })

  return { multiple, projects, selectedProjects }
}

export default useSelectedProjects
