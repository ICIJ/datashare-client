import { compact, find, keys, kebabCase, iteratee, uniq } from 'lodash'

import Murmur from '@icij/murmur-next'

import { slugger } from '@/utils/strings'

/**
 * Prefix used to identify Murmur components in findComponent/getComponent calls.
 * @constant {string}
 */
const MURMUR_PREFIX = 'murmur/'

/**
 * Mixin class extending the core to add helpers for components.
 * @mixin
 * @typicalname datashare
 */
const ComponentMixin = superclass =>
  class extends superclass {
    /**
     * Asynchronously find a component in the lazyComponents object by its name.
     * Supports "Murmur/" prefix to retrieve components from @icij/murmur-next.
     * @async
     * @function
     * @param {string} name - The name of the component to find.
     * @returns {Promise.<Object>} - A promise that resolves with the found component object, or null if not found.
     */
    findComponent(name) {
      return this.getComponent(name).catch(() => null)
    }

    /**
     * Get a component from Murmur by its name.
     * Searches in Murmur.components, Murmur.datavisualisations, and Murmur.maps.
     * @function
     * @param {string} name - The name of the Murmur component to retrieve.
     * @returns {Object} - The found component object, or null if not found.
     */
    getMurmurComponent(name) {
      return Murmur.components[name] ?? Murmur.datavisualisations[name] ?? Murmur.maps[name] ?? null
    }

    /**
     * Check if name has "Murmur/" prefix and return the component from @icij/murmur-next.
     * @function
     * @param {string} name - The name of the component to retrieve, potentially with "Murmur/" prefix.
     * @returns {Promise.<Object>} - The found Murmur component, or null if not a Murmur component or not found.
     */
    findMurmurComponentByPrefix(name) {
      if (name.toLowerCase().startsWith(MURMUR_PREFIX)) {
        const murmurName = name.slice(MURMUR_PREFIX.length)
        return Promise.resolve(this.getMurmurComponent(murmurName))
      }
      return Promise.resolve(null)
    }

    /**
     * Find a component in the lazyComponents object by its name.
     * @function
     * @param {string} name - The name of the component to retrieve.
     * @returns {Promise.<Object>} - The found component, or null if not found.
     */
    findLocalComponentByName(name) {
      const key = find(keys(this.lazyComponents), key => this.sameComponentNames(name, key))
      if (key) {
        return this.lazyComponents[key]?.().then(iteratee('default'))
      }
      return Promise.resolve(null)
    }

    /**
     * List of component finder functions to try in order.
     * Each finder takes a name and returns a Promise that resolves to an object or null.
     * @returns {Array.<Function>} - Array of finder functions.
     */
    get componentFinders() {
      return [
        name => this.findMurmurComponentByPrefix(name),
        name => this.findLocalComponentByName(name)
      ]
    }

    /**
     * Asynchronously get a component by trying each finder in order.
     * Supports "Murmur/" prefix to retrieve components from @icij/murmur-next.
     * @async
     * @function
     * @param {string} name - The name of the component to retrieve.
     * @returns {Promise.<Object>} - A promise that resolves with the found component object, or rejects with an Error if not found.
     */
    async getComponent(name) {
      for (const finder of this.componentFinders) {
        const component = await finder(name)
        if (component) {
          return component
        }
      }
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
      // Remove the leading '/components/' from the name and split it by '/' to extract the path.
      const path = name.split('/components/').pop().split('/').slice(0, -1).join('/') || ''
      // Split the name by '/' and get the last element (the file name) from the array.
      const filname = name.split('/').pop()
      // Remove the file extension from the file name (e.g., '' or '.js') using regex.
      const component = filname.replace(/\.(vue|js)$/i, '')
      // Convert the component name to kebab case and then to lowercase using the slugger utility function.
      const componentSlug = slugger(kebabCase(component)).toLowerCase()
      // Return the final slug by concatenating the path and the slugified component name.
      return compact([path, componentSlug]).join('/')
    }

    /**
     * Get the lazyComponents object using require.context for lazy loading of components.
     * @function
     * @returns {Object} - The lazyComponents object generated using require.context.
     */
    get lazyComponents() {
      return import.meta.glob('@/components/**/*.(vue|js)')
    }
  }

export default ComponentMixin
