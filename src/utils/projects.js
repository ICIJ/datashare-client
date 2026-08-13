import isObject from 'lodash/isObject'

/**
 * Normalize a project prop, which may be a bare name, a project object, or a
 * list of either, into a list.
 */
export function toProjectList(projects) {
  return [].concat(projects ?? [])
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
