import toString from 'lodash/toString'
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/**
 * Convert a bare filter name plus its current exclude state into the
 * `-`-prefixed name convention used by locked filter entries (and by route
 * params: `f[name]` / `f[-name]`).
 *
 * @param {string} name - The bare filter name (no `-` prefix).
 * @param {boolean} excluded - Whether the filter is currently in exclude mode.
 * @returns {string}
 */
export function toLockedName(name, excluded) {
  return excluded ? `-${name}` : name
}

/**
 * Parse a lock entry's `-`-prefixed name back into its bare name and
 * exclude state.
 *
 * @param {string} lockedName - The name as stored on a lock entry.
 * @returns {{ name: string, excluded: boolean }}
 */
export function parseLockedName(lockedName) {
  const excluded = lockedName.startsWith('-')
  return { name: excluded ? lockedName.slice(1) : lockedName, excluded }
}

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
   * Rename a locked entry's key in place — e.g. when a filter's
   * include/exclude mode flips and its locks need to follow, without
   * dropping and re-adding the entry under the new key (which would
   * otherwise mean an unlock-then-lock dance per entry, and briefly not
   * locked in between). No-op if `name`+`value` isn't currently locked.
   *
   * If `newName`+`value` is already locked too (e.g. a stale lock from a
   * previous flip nobody cleaned up), the old entry is dropped instead of
   * renamed, since the new key is already correctly represented and
   * `entries` never holds two entries for the same key.
   *
   * @public
   * @param {Object} params
   * @param {string} params.name - The entry's current name (may carry a `-` prefix).
   * @param {string} params.newName - The name to rename it to.
   * @param {string|number} params.value - The filter value identifying the entry.
   */
  function retag({ name, newName, value }) {
    const index = findIndex({ name, value })
    if (index === -1) {
      return
    }
    if (findIndex({ name: newName, value }) > -1) {
      entries.value.splice(index, 1)
    }
    else {
      entries.value[index] = { ...entries.value[index], name: newName }
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
    retag,
    unlockAll
  }
}, {
  persist: true
})
