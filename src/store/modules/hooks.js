import filter from 'lodash/filter'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import orderBy from 'lodash/orderBy'
import { computed, reactive, markRaw } from 'vue'
import { defineStore } from 'pinia'

import { HookedComponent } from '@/store/hooks'

export const useHooksStore = defineStore('hooks', () => {
  const registered = reactive([])

  /**
   * Register a new hooked component
   *
   * @param {Object} options
   * @param {string} options.target - The target hook
   * @param {number} [options.order] - The order of the hooked component
   * @param {string} [options.name] - The name of the hooked component
   * @param {Object} [options.definition] - The definition of the hooked component
   */
  const register = ({ target, order, name, definition = {} }) => {
    const index = name ? findIndex(registered, { name }) : -1
    if (index === -1) {
      registered.push({
        target,
        order,
        name,
        definition: markRaw(definition)
      })
    }
  }

  /**
   * Unregister a hooked component
   *
   * @param {string} name - The name of the hooked component
   */
  const unregister = (name) => {
    const index = findIndex(registered, { name })

    if (index > -1) {
      registered.splice(index, 1)
    }
  }

  /**
   * Reset all registered components
   */
  const reset = () => {
    registered.splice(0, registered.length)
  }

  /**
   * Reset all registered components for a specific target*
   *
   * @param {string} target - The target hook
   */
  const resetTarget = (target) => {
    // This is a method to remove all registered components for a specific target
    // without creating a new array reference
    registered.splice(0, registered.length, ...registered.filter(r => r.target !== target))
  }

  const components = computed(() => {
    return orderBy(registered.map(HookedComponent.create), 'order', 'asc')
  })

  const filterComponentsByTarget = computed(() => {
    return target => filter(components.value, { target })
  })

  const getComponentByName = computed(() => {
    return name => find(components.value, { name })
  })

  return {
    registered,
    register,
    unregister,
    reset,
    resetTarget,
    components,
    filterComponentsByTarget,
    getComponentByName
  }
})
