import { CONTENT_TYPE_CATEGORY_FILTER_NAME } from './FilterContentTypeCategory'

/**
 * Single source of truth for filters whose state must be kept in lockstep
 * across two backing dimensions. The map is intentionally small and explicit:
 * each entry lists a canonical name and its paired dimension.
 *
 * When extending, remember the pairing is a 1:1 relationship — each dimension
 * appears exactly once as a canonical key.
 */
export const PAIRED_DIMENSIONS = Object.freeze({
  contentType: CONTENT_TYPE_CATEGORY_FILTER_NAME
})

/**
 * Reverse lookup so consumers can resolve the pair from either side without
 * caring which name is the canonical one. Built once at module load.
 */
const REVERSE_PAIRED_DIMENSIONS = Object.freeze(
  Object.fromEntries(Object.entries(PAIRED_DIMENSIONS).map(([canonical, paired]) => [paired, canonical]))
)

/**
 * Resolve the paired dimension for a filter name.
 *
 * @param {string} name - Filter name (e.g. `contentType` or `contentTypeCategory`).
 * @returns {string|null} The name of the paired dimension, or `null` when the
 *   filter has no pair.
 */
export function getPairedDimension(name) {
  return PAIRED_DIMENSIONS[name] ?? REVERSE_PAIRED_DIMENSIONS[name] ?? null
}

/**
 * Return every dimension that should be toggled together for a given filter
 * name, including the name itself. Consumers can iterate the result without
 * special-casing unpaired filters.
 *
 * @param {string} name - Filter name.
 * @returns {string[]} `[name]` when unpaired, `[name, paired]` otherwise.
 */
export function getPairedDimensions(name) {
  const paired = getPairedDimension(name)
  return paired ? [name, paired] : [name]
}

/**
 * The canonical dimension for a paired filter. When two paired dimensions
 * disagree on read, reconciliation should prefer the canonical one.
 *
 * @param {string} name - Filter name.
 * @returns {string} The canonical name for the pair, or `name` if unpaired.
 */
export function getCanonicalDimension(name) {
  if (Object.prototype.hasOwnProperty.call(PAIRED_DIMENSIONS, name)) {
    return name
  }
  return REVERSE_PAIRED_DIMENSIONS[name] ?? name
}
