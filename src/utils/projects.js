import castArray from 'lodash/castArray'
import isObject from 'lodash/isObject'

/**
 * Normalize a project prop, which may be a bare name, a project object, or a
 * list of either, into a list.
 *
 * Missing entries are dropped rather than kept as holes: task lists build their
 * project list positionally, as in `[item.args?.defaultProject]`, so a blank or
 * absent project would otherwise render as a nameless project.
 */
export function toProjectList(projects) {
  return castArray(projects).filter(Boolean)
}

/**
 * Resolve a project name or object against the configured projects, so labels
 * and logos render consistently wherever a project is displayed.
 */
export function resolveProject(project, core) {
  if (isObject(project)) {
    return core?.findProject(project.name) ?? project
  }

  return core?.findProject(project) ?? { name: project }
}
