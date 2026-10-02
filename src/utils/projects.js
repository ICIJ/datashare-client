import castArray from 'lodash/castArray'
import isObject from 'lodash/isObject'
import startCase from 'lodash/startCase'

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

/**
 * The name an already resolved project is displayed under: its label, or its name in title case
 * when it has none.
 */
export function displayLabelOf(resolved) {
  return resolved.label ?? startCase(resolved.name)
}

/**
 * The name a project (a bare name or an object) is displayed under, see displayLabelOf.
 */
export function projectDisplayLabel(project, core) {
  return displayLabelOf(resolveProject(project, core))
}
