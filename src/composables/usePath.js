import { trimEnd } from 'lodash'
import { computed, toRef } from 'vue'

import { useConfig } from '@/composables/useConfig'

/**
 * Composable for managing and manipulating file and directory paths.
 *
 * @param {import('vue').Ref<string[]|null>} selectedPathsRef - A ref containing the currently selected paths.
 * @param {Object} options - Configuration options.
 * @param {boolean} options.multiple - Whether multiple paths can be selected. Default is false.
 * @returns {Object} An object containing path manipulation methods and properties.
 */
export function usePath(selectedPathsRef, { multiple = false } = {}) {
  const config = useConfig()
  const selectedPaths = toRef(selectedPathsRef ?? [])

  const pathSeparator = computed(() => {
    return config.get('pathSeparator', '/')
  })

  /**
   * Returns the last segment of a path.
   * Similar to Node.js `path.basename`.
   *
   * @param {string} path
   * @returns {string}
   */
  function getBasename(path) {
    return path.split(pathSeparator.value).filter(Boolean).pop() || ''
  }

  /**
   * Normalizes a directory path by ensuring it ends with a separator.
   *
   * @param {string} path
   * @returns {string}
   */
  function normalizeDirectory(path) {
    return trimEnd(path, pathSeparator.value) + pathSeparator.value
  }

  /**
   * Checks if a path is selected.
   *
   * @param {string} path
   * @returns {boolean}
   */
  function isSelectedPath(path) {
    return selectedPaths
      .value
      .map(normalizeDirectory)
      .includes(normalizeDirectory(path))
  }

  /**
   * Checks if a directory is in an indeterminate state.
   * A directory is indeterminate if some, but not all, of its children are selected.
   *
   * @param {string} path
   * @returns {boolean}
   */
  function isIndeterminateDirectory(path) {
    const normalized = normalizeDirectory(path)

    return selectedPaths.value.some((selected) => {
      return normalizeDirectory(selected).startsWith(normalized) && !isSelectedPath(path)
    })
  }

  /**
   * Selects a path. If `multiple` is false, it will replace the current selection.
   *
   * @param {string} path
   */
  function selectPath(path) {
    const normalized = normalizeDirectory(path)

    if (multiple) {
      selectedPaths.value = [...selectedPaths.value, normalized]
    }
    else {
      selectedPaths.value = [normalized]
    }
  }

  /**
   * Unselects a path.
   *
   * @param {string} path
   */
  function unselectPath(path) {
    const normalized = normalizeDirectory(path)
    const index = selectedPaths.value.indexOf(normalized)
    if (index > -1) {
      selectedPaths.value = selectedPaths.value.toSpliced(index, 1)
    }
  }

  /**
   * Toggles the selection state of a path. If selected, it will
   * be unselected and vice versa.
   *
   * @param {string} path
   */
  function togglePath(path) {
    if (isSelectedPath(path)) {
      unselectPath(path)
    }
    else {
      selectPath(path)
    }
  }

  return {
    pathSeparator,
    getBasename,
    normalizeDirectory,
    isSelectedPath,
    isIndeterminateDirectory,
    selectPath,
    unselectPath,
    togglePath,
    selectedPaths,
  }
}

export default usePath
