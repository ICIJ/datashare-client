import { toValue } from 'vue'

import { useMemoKey } from '@/composables/useMemoKey'

/**
 * Composable to generate v-memo dependencies for document entries.
 *
 * Provides a consistent way to define memo dependencies across all
 * document entry components (list, table, grid).
 *
 * @returns {Object} Memo utilities with semantic methods for document entries
 *
 * @example
 * const { addProperties, addSelectMode, getMemoKey } = useDocumentEntryMemo()
 *
 * addProperties(() => props.properties)
 * addSelectMode(() => props.selectMode)
 *
 * // In template:
 * v-memo="getMemoKey(entry, selectionValues[entry.id], isRouteActive(entry))"
 */
export function useDocumentEntryMemo() {
  const { add, build } = useMemoKey()

  /**
   * Adds the properties array as a memo dependency.
   * @param {Ref|Function} properties - Properties ref or getter
   */
  const addProperties = (properties) => {
    add('propertiesKey', () => JSON.stringify(toValue(properties)))
  }

  /**
   * Adds the select mode as a memo dependency.
   * @param {Ref|Function} selectMode - Select mode ref or getter
   */
  const addSelectMode = (selectMode) => {
    add('selectModeKey', () => toValue(selectMode))
  }

  /**
   * Generates the memo key for a document entry.
   *
   * @param {Object} entry - The document entry
   * @param {boolean} isSelected - Whether the entry is selected
   * @param {boolean} [isActive=false] - Whether the entry is active
   * @returns {Array} Memo key array for v-memo directive
   */
  const getMemoKey = (entry, isSelected, isActive = false) => {
    return build([entry.id, isSelected, isActive])
  }

  return {
    addProperties,
    addSelectMode,
    add,
    getMemoKey
  }
}
