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
 * Unlock every value dropped between two value arrays. For filter types
 * whose `computedFilterValues({ set })` override replaces the whole values
 * array at once rather than adding/removing one value at a time (path,
 * recommendedBy) - that bypasses `useSearchFilter`'s own central
 * unlock-on-remove path, so the caller has to do it explicitly.
 *
 * @param {ReturnType<typeof useLockedFiltersStore>} lockedFiltersStore
 * @param {string} name - The lock's `-`-prefixed name (see `toLockedName`).
 * @param {string[]} previousValues - The values before this write.
 * @param {string[]} nextValues - The values being written.
 * @returns {void}
 */
export function unlockRemovedValues(lockedFiltersStore, name, previousValues, nextValues) {
  for (const value of previousValues) {
    if (!nextValues.includes(value)) {
      lockedFiltersStore.unlock({ name, value })
    }
  }
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

  function entryKey(name, value) {
    return `${name}\0${toString(value)}`
  }

  /**
   * Maps an entry's `name`+`value` key to its index in `entries`, rebuilt
   * whenever `entries` changes. `isLocked` is called once per rendered
   * filter row on every re-render, so this trades an O(n) rebuild per
   * mutation (lock/unlock, infrequent) for O(1) lookups per render (frequent)
   * instead of an O(n) `findIndex` scan on every single one.
   *
   * @private
   */
  const indexByKey = computed(() => {
    const map = new Map()
    entries.value.forEach((entry, i) => map.set(entryKey(entry.name, entry.value), i))
    return map
  })

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
    return indexByKey.value.has(entryKey(name, value))
  }

  /**
   * Lock a filter value. Upserts: if `{ name, value }` is already locked,
   * its label is updated in place rather than adding a duplicate entry.
   *
   * A filter dimension can only be applied in one include/exclude mode at a
   * time, so any existing locks under the same bare dimension but the
   * opposite mode are retagged to this mode first. Without this, two locks
   * on the same dimension could disagree on mode forever: the search store
   * can only satisfy one mode per dimension when applying locks, so the
   * other would stay permanently conflicting (icij/datashare#2332).
   *
   * @public
   * @param {Object} params
   * @param {string} params.name - The filter name.
   * @param {string|number} params.value - The filter value.
   * @param {string} params.label - The human-readable label to display for this lock.
   */
  function lock({ name, value, label }) {
    const stringValue = toString(value)
    const oppositeName = name.startsWith('-') ? name.slice(1) : `-${name}`
    entries.value
      .filter(entry => entry.name === oppositeName)
      .forEach(entry => retag({ name: oppositeName, newName: name, value: entry.value }))
    const index = indexByKey.value.get(entryKey(name, stringValue))
    const entry = { name, value: stringValue, label }
    if (index !== undefined) {
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
    const index = indexByKey.value.get(entryKey(name, value))
    if (index !== undefined) {
      entries.value.splice(index, 1)
    }
  }

  /**
   * Rename a locked entry's `name` in place, e.g. on an include/exclude mode
   * flip where `name` changes but the entry (its value and label) should
   * survive, rather than being deleted and re-created under the new name.
   * No-op if `{ name, value }` isn't currently locked.
   *
   * @public
   * @param {Object} params
   * @param {string} params.name - The entry's current name.
   * @param {string} params.newName - The name to rename it to.
   * @param {string|number} params.value - The filter value.
   */
  function retag({ name, newName, value }) {
    const index = indexByKey.value.get(entryKey(name, value))
    if (index === undefined) {
      return
    }
    // Guard against a pre-existing entry under { newName, value }
    if (indexByKey.value.has(entryKey(newName, value))) {
      entries.value.splice(index, 1)
      return
    }
    entries.value[index] = { ...entries.value[index], name: newName }
  }

  /**
   * Unlock every locked entry matching `predicate`, in a single pass rather
   * than filtering then unlocking each match one at a time (which would
   * re-scan/re-splice `entries` once per match).
   *
   * @public
   * @param {(entry: { name: string, value: string, label: string }) => boolean} predicate
   */
  function unlockWhere(predicate) {
    entries.value = entries.value.filter(entry => !predicate(entry))
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
    unlockWhere,
    unlockAll
  }
}, {
  persist: true
})
