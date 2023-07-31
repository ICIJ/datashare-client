import { find, kebabCase, iteratee, uniq } from 'lodash'

import { slugger } from '@/utils/strings'

/**
 * Mixin class extending the core to add helpers for components.
 * @mixin
 * @typicalname datashare
 */
const ComponentMixin = (superclass) =>
  class extends superclass {
    /**
     * Asynchronously find a component in the lazyComponents object by its name.
     * @async
     * @function
     * @param {string} name - The name of the component to find.
     * @returns {Promise<object|null>} - A promise that resolves with the found component object, or null if not found.
     */
    findComponent(name) {
      return this.getComponent(name).catch(() => null)
    }

    /**
     * Asynchronously get a component from the lazyComponents object based on its name.
     * @async
     * @function
     * @param {string} name - The name of the component to retrieve.
     * @returns {Promise<object|Error>} - A promise that resolves with the found component object, or rejects with an Error if not found.
     */
    async getComponent(name) {
      // Find the component name key in lazyComponents object that matches the given name when slugified.
      const key = find(this.lazyComponents.keys(), (key) => this.sameComponentNames(name, key))
      // If a matching key is found, return the component object from the lazyComponents object.
      if (key) {
        return this.lazyComponents(key).then(iteratee('default'))
      }
      // Otherwise, return an Error indicating that the component cannot be found.
      throw new Error(`Cannot find component '${name}'`)
    }

    /**
     * Check if multiple component names are the same when slugified.
     * @function
     * @param {...string} names - The component names to compare.
     * @returns {boolean} - True if all names are the same when slugified, false otherwise.
     */
    sameComponentNames(...names) {
      // Map each component name to its slugified version using the componentNameSlugger function,
      // then remove duplicate entries and check if there is only one unique slug.
      return uniq(names.map(this.componentNameSlug)).length === 1
    }

    /**
     * Generate a slug from the component name using kebab case and lowercase.
     * @function
     * @param {string} name - The name of the component to slugify.
     * @returns {string} - The slugified component name.
     */
    componentNameSlug(name) {
      // Remove the leading './' from the name and split it by '/' to extract the path.
      const path = name.replace(/^\.\//, '').split('/').slice(0, -1).join('/') || ''
      // Split the name by '/' and get the last element (the file name) from the array.
      const filname = name.split('/').pop()
      // Remove the file extension from the file name (e.g., '.vue' or '.js') using regex.
      const component = filname.replace(/\.(vue|js)$/i, '')
      // Convert the component name to kebab case and then to lowercase using the slugger utility function.
      const componentSlug = slugger(kebabCase(component)).toLowerCase()
      // Return the final slug by concatenating the path and the slugified component name.
      return `${path}/${componentSlug}`
    }

    /**
     * Get the lazyComponents object using require.context for lazy loading of components.
     * @function
     * @returns {Object} - The lazyComponents object generated using require.context.
     */
    get lazyComponents() {
      return require.context('@/components/', true, /\.(vue|js)$/, 'lazy')
    }
  }

export default ComponentMixin
