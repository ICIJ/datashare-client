import cloneDeep from 'lodash/cloneDeep'
import filter from 'lodash/filter'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import isFunction from 'lodash/isFunction'
import orderBy from 'lodash/orderBy'
import uniqueId from 'lodash/uniqueId'

import pipelines from '@/store/pipelines'
import * as pipelineTypes from '@/store/pipelines'

export const state = {
  // A list of registered pipeline
  registered: cloneDeep({ pipelines }).pipelines
}

export const getters = {
  instantiatePipeline (state) {
    return ({ type = 'IdentityPipeline', ...options } = { }) => {
      // The given type is a class with a `apply` method
      if (type?.prototype?.apply) {
        // eslint-disable-next-line new-cap
        return new type(options)
      // The given type is function
      } else if (isFunction(type)) {
        return new pipelineTypes.SimplePipeline({ apply: type, ...options })
      }
      const Type = pipelineTypes[type] || pipelineTypes.IdentityPipeline
      // Return the instance
      return new Type(options)
    }
  },
  instantiatedPipelines (state, getters) {
    return orderBy(state.registered.map(pipeline => {
      return getters.instantiatePipeline(pipeline)
    }, 'order', 'asc'))
  },
  getPipelineByName (state) {
    return name => find(state.registered, { name })
  },
  getPipelinesByCategory (state, getters) {
    return (category = null) => {
      return orderBy(filter(state.registered, { category }), 'order', 'asc')
    }
  },
  getInstantiatedPipelineByName (state, getters) {
    return name => {
      const pipeline = getters.getPipelineByName(name)
      return pipeline ? getters.instantiatePipeline(pipeline) : null
    }
  },
  getInstantiatedPipelineByCategory (state, getters) {
    return (category = null) => {
      return getters.getPipelinesByCategory(category).map(getters.instantiatePipeline)
    }
  },
  getPipelineChainByCategory (state, getters) {
    return (category = null) => {
      const pipelines = getters.getInstantiatedPipelineByCategory(category)
      return pipelines.map(p => p.apply.bind(p))
    }
  }
}

export const mutations = {
  register (state, { name, ...options }) {
    name = name || uniqueId('pipeline-')
    const index = name ? findIndex(state.registered, { name }) : -1
    if (index === -1) {
      state.registered.push({ name, ...options })
    }
  },
  unregister (state, name) {
    const index = findIndex(state.registered, { name })
    if (index > -1) {
      state.registered.splice(index, 1)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
