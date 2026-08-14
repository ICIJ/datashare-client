import toString from 'lodash/toString'
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/**
 * Store for managing the user's personal, cross-project locked filters.
 *
 * A lock entry is `{ name, value, label }`. `name` already carries the
 * `-`-prefix-for-excluded convention used by route params (`f[name]` /
 * `f[-name]`) and breadcrumb entries, so include/exclude mode is part of a
 * lock's identity — there is no separate `excluded` field, and no
 * project/index field, by design (locks are personal and cross-project).
 *
 * @returns {object} The store instance.
 */
export const useLockedFiltersStore = defineStore('lockedFilters', () => {
  /**
   * Reactive array of locked entries.
   * @type {Array<{ name: string, value: string, label: string }>}
   */
  const entries = ref([])

  /**
   * Find the index of a lock entry matching `{ name, value }`.
   *
   * @private
   * @param {Object} params
   * @param {string} params.name - The filter name (may carry a `-` prefix).
   * @param {string|number} params.value - The filter value.
   * @returns {number} The entry's index, or -1 if not locked.
   */
  function findIndex({ name, value }) {
    const stringValue = toString(value)
    return entries.value.findIndex(entry => entry.name === name && entry.value === stringValue)
  }

  /**
   * Check whether a given filter value is currently locked.
   *
   * @public
   * @param {Object} params
   * @param {string} params.name - The filter name.
   * @param {string|number} params.value - The filter value.
   * @returns {boolean}
   */
  function isLocked({ name, value }) {
    return findIndex({ name, value }) > -1
  }

  /**
   * Lock a filter value. Upserts: if `{ name, value }` is already locked,
   * its label is updated in place rather than adding a duplicate entry.
   *
   * @public
   * @param {Object} params
   * @param {string} params.name - The filter name.
   * @param {string|number} params.value - The filter value.
   * @param {string} params.label - The human-readable label to display for this lock.
   */
  function lock({ name, value, label }) {
    const stringValue = toString(value)
    const index = findIndex({ name, value: stringValue })
    const entry = { name, value: stringValue, label }
    if (index > -1) {
      entries.value[index] = entry
    }
    else {
      entries.value.push(entry)
    }
  }

  /**
   * Unlock a filter value. No-op if it isn't currently locked.
   *
   * @public
   * @param {Object} params
   * @param {string} params.name - The filter name.
   * @param {string|number} params.value - The filter value.
   */
  function unlock({ name, value }) {
    const index = findIndex({ name, value })
    if (index > -1) {
      entries.value.splice(index, 1)
    }
  }

  /**
   * Unlock every currently locked filter value.
   *
   * @public
   */
  function unlockAll() {
    entries.value = []
  }

  /**
   * The number of currently locked entries.
   */
  const count = computed(() => entries.value.length)

  return {
    entries,
    count,
    isLocked,
    lock,
    unlock,
    unlockAll
  }
}, {
  persist: true
})
