import { find, kebabCase, iteratee } from 'lodash'

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
    async findComponent(name) {
      const componentKey = find(this.lazyComponents.keys(), (key) => {
        return this.componentNameSlugger(name) === this.componentNameSlugger(key)
      })
      return componentKey ? this.lazyComponents(componentKey).then(iteratee('default')) : null
    }

    /**
     * Generate a slug from the component name using kebab case and lowercase.
     * @function
     * @param {string} name - The name of the component to slugify.
     * @returns {string} - The slugified component name.
     */
    componentNameSlugger(name) {
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
