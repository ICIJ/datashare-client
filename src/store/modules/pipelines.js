import { cloneDeep, compact, concat, filter, find, findIndex, isFunction, orderBy, uniqueId } from 'lodash'

import pipelines from '@/store/pipelines'
import * as pipelineTypes from '@/store/pipelines'

export const state = {
  // A list of registered pipeline
  registered: cloneDeep({ pipelines }).pipelines
}

export const getters = {
  instantiatePipeline() {
    return ({ type = 'IdentityPipeline', ...options } = {}) => {
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
  instantiatedPipelines(state, getters) {
    return orderBy(
      state.registered.map(
        (pipeline) => {
          return getters.instantiatePipeline(pipeline)
        },
        'order',
        'asc'
      )
    )
  },
  getPipelineByName(state) {
    return (name) => find(state.registered, { name })
  },
  getPipelinesByCategory(state) {
    return (category = null) => {
      return orderBy(filter(state.registered, { category }), 'order', 'asc')
    }
  },
  getInstantiatedPipelineByName(state, getters) {
    return (name) => {
      const pipeline = getters.getPipelineByName(name)
      return pipeline ? getters.instantiatePipeline(pipeline) : null
    }
  },
  getInstantiatedPipelineByCategory(state, getters) {
    return (category = null) => {
      return getters.getPipelinesByCategory(category).map(getters.instantiatePipeline)
    }
  },
  getPipelineChainByCategory(state, getters) {
    return (category = null) => {
      const pipelines = getters.getInstantiatedPipelineByCategory(category)
      return pipelines.map((p) => p.apply.bind(p))
    }
  },
  getFullPipelineChainByCategory(state, getters) {
    return (category = null, ...contextualPipelines) => {
      const prePipelines = getters.getPipelineChainByCategory(`${category}:pre`)
      const mainPipelines = getters.getPipelineChainByCategory(category)
      const postPipelines = getters.getPipelineChainByCategory(`${category}:post`)
      return concat(prePipelines, mainPipelines, compact(contextualPipelines), postPipelines)
    }
  },
  applyPipelineChainByCategory(state, getters) {
    return (category = null, ...mainPipelines) => {
      const allPipelines = getters.getFullPipelineChainByCategory(category, ...mainPipelines)
      // Return a closure function that must be invoked with the value
      // that is transformed by the pipeline
      return async (value = null, ...params) => {
        return allPipelines.reduce(async (intermediateValue, fn) => {
          return fn(await intermediateValue, ...params)
        }, value)
      }
    }
  }
}

export const mutations = {
  register(state, { name, ...options }) {
    name = name || uniqueId('pipeline-')
    const index = name ? findIndex(state.registered, { name }) : -1
    if (index === -1) {
      state.registered.push({ name, ...options })
    }
  },
  unregister(state, name) {
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
