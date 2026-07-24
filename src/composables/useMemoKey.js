import { computed, toValue } from 'vue'

/**
 * Creates a declarative memo key builder for v-memo optimization.
 *
 * This composable provides a flexible way to build memo keys for Vue's v-memo directive.
 * It separates static dependencies (shared across all items) from dynamic dependencies
 * (specific to each item), making it easy to create consistent memoization strategies.
 *
 * @returns {Object} Builder utilities
 */
export function useMemoKey() {
  const staticDependencies = new Map()

  /**
   * Registers a static dependency that will be included in all memo keys.
   * Static dependencies are computed values that don't change per-item.
   *
   * @param {string} name - Unique identifier for this dependency
   * @param {Ref|Function} valueOrGetter - A ref or a function returning the dependency value
   *
   * @example
   * add('theme', theme) // with a ref
   * add('props', () => JSON.stringify(props.items)) // with a getter
   */
  const add = (name, valueOrGetter) => {
    const getter = typeof valueOrGetter === 'function' ? valueOrGetter : () => valueOrGetter
    staticDependencies.set(name, computed(() => toValue(getter())))
  }

  /**
   * Removes a static dependency.
   *
   * @param {string} name - The dependency name to remove
   * @returns {boolean} True if the dependency was removed
   */
  const remove = (name) => {
    return staticDependencies.delete(name)
  }

  /**
   * Gets all current static dependency values as an array.
   *
   * @returns {Array} Array of static dependency values
   */
  const getAll = () => {
    return Array.from(staticDependencies.values()).map(dep => dep.value)
  }

  /**
   * Gets a specific static dependency value by name.
   *
   * @param {string} name - The dependency name
   * @returns {*} The dependency value or undefined if not found
   */
  const get = (name) => {
    return staticDependencies.get(name)?.value
  }

  /**
   * Checks if a static dependency exists.
   *
   * @param {string} name - The dependency name
   * @returns {boolean} True if the dependency exists
   */
  const has = (name) => {
    return staticDependencies.has(name)
  }

  /**
   * Builds the final memo key array from dynamic values.
   * Combines the provided dynamic values with all registered static dependencies.
   *
   * @param {Object|Array} dynamicValues - Dynamic values specific to this item
   *   - If Object: values are extracted and ordered by key name
   *   - If Array: values are used as-is
   * @returns {Array} Complete memo key array for v-memo directive
   */
  const build = (dynamicValues = {}) => {
    const dynamicArray = Array.isArray(dynamicValues)
      ? dynamicValues
      : Object.values(dynamicValues)
    return [...dynamicArray, ...getAll()]
  }

  return {
    add,
    remove,
    get,
    getAll,
    has,
    build
  }
}
