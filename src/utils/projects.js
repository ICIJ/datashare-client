import isString from 'lodash/isString'

/**
 * Normalize a project prop into a list. Components accept either a bare project
 * name, a project object, or a list of them, so callers share this coercion
 * rather than each repeating it.
 *
 * @param {Array|String|Object} projects
 * @returns {Array} the projects as a list
 */
export function toProjectList(projects) {
  if (isString(projects)) {
    return [projects]
  }

  return projects ?? []
}
