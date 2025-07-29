import { defineStore } from 'pinia'
import { ref } from 'vue'
import { castArray, flatten, map, sumBy } from 'lodash'

import { apiInstance as api } from '@/api/apiInstance'

export const useRecommendedStore = defineStore('recommended', () => {
  const byUsers = ref([])
  const documents = ref([])
  const total = ref(0)

  /**
   * Fetches recommendations for each index in the search module and updates the state.
   *
   * It retrieves the recommendations for each index, calculates the total count,
   * aggregates the results by user, and updates the store accordingly.
   *
   * @param {Array} indices - An array of indices to fetch recommendations from.
   * @returns {Promise<void>}
   */
  async function fetchIndicesRecommendations(indices) {
    try {
      const recommendationsByProject = indices.map(index => api.getRecommendationsByProject(index))
      const recommendations = await Promise.all(recommendationsByProject)
      total.value = sumBy(recommendations, 'totalCount')
      const aggregates = flatten(map(recommendations, 'aggregates'))
      const aggregatedByUsers = aggregates.map(({ count, ...user }) => ({
        user: user.item.id,
        count
      }))
      const sumByUsers = aggregatedByUsers.reduce((merged, { user, count }) => {
        merged[user] ||= { user, count: 0 }
        merged[user].count += count
        return merged
      }, {})
      byUsers.value = Object.values(sumByUsers)
    }
    catch (_) {
      byUsers.value = []
      total.value = 0
    }
  }

  /**
   * Fetches recommendations for a single index and returns the result.
   * @param {String} index - The index to fetch recommendations from.
   * @returns {Promise<void>}
   */
  async function fetchIndexRecommendations(index) {
    return fetchIndicesRecommendations(castArray(index))
  }

  /**
   * Retrieves documents recommended by specified users and updates the state.
   *
   * If the provided users array is non-empty, the function fetches the documents for each index.
   * Otherwise, it clears the documents state.
   *
   * @param {Array} indices - An array of indices to fetch recommendations from.
   * @param {Array} users - An array of users for which to fetch document recommendations.
   * @returns {Promise<void>}
   */
  async function getDocumentsRecommendedBy(indices, users) {
    try {
      if (indices.length + users.length > 1) {
        const documentsByProject = indices.map(index => api.getDocumentsRecommendedBy(index, users))
        documents.value = flatten(await Promise.all(documentsByProject))
      }
      else {
        documents.value = []
      }
    }
    catch (_) {
      documents.value = []
    }
  }

  return {
    byUsers,
    documents,
    total,
    fetchIndicesRecommendations,
    fetchIndexRecommendations,
    getDocumentsRecommendedBy
  }
})
