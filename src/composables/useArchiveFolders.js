import { computed, nextTick, onBeforeUnmount, reactive, toValue, watch } from 'vue'

import { ARCHIVE_PAGE_SIZE, toEntryKey } from '@/utils/archiveTree'

/**
 * The open folders of an archive tree, how many files each one shows, and the
 * active search match they reveal.
 *
 * @param {Object} options
 * @param {Ref<Object>} options.tree - The archive tree
 * @param {Ref<Object|null>} options.activeMatch - The active search match
 * @param {MaybeRefOrGetter<HTMLElement>} options.root - The element holding the tree
 * @returns {Object} The folder state and the actions changing it
 */
export function useArchiveFolders({ tree, activeMatch, root }) {
  const openPaths = reactive(new Set())
  const activeKeys = reactive(new Set())
  const limits = reactive(new Map())
  let stopScrollAfterExpand = () => {}

  const activeKey = computed(() => (activeMatch.value ? toEntryKey(activeMatch.value) : null))

  function toggle(path) {
    stopScrollAfterExpand()
    if (openPaths.has(path)) {
      openPaths.delete(path)
    }
    else {
      openPaths.add(path)
    }
  }

  function showMore(path) {
    const limit = limits.get(path) ?? ARCHIVE_PAGE_SIZE
    limits.set(path, limit + ARCHIVE_PAGE_SIZE)
  }

  function reset() {
    openPaths.clear()
    limits.clear()
    tree.value.folders.forEach(folder => openPaths.add(folder.path))
  }

  function openFolders(paths) {
    const closedPaths = paths.filter(path => !openPaths.has(path))
    closedPaths.forEach(path => openPaths.add(path))
    return closedPaths.length > 0
  }

  function showDocumentPage({ folderPath, index }) {
    const limit = limits.get(folderPath) ?? ARCHIVE_PAGE_SIZE
    if (index >= limit) {
      const pages = Math.floor(index / ARCHIVE_PAGE_SIZE) + 1
      limits.set(folderPath, pages * ARCHIVE_PAGE_SIZE)
    }
  }

  // Each folder reads only its own key, so moving the active match re-renders
  // the two folders holding the previous and the next match, not all of them.
  function moveActiveKey(key, previousKey) {
    activeKeys.delete(previousKey)
    if (key) {
      activeKeys.add(key)
    }
  }

  function findEntryElement(key) {
    return toValue(root)?.querySelector(`[data-archive-entry="${CSS.escape(key)}"]`)
  }

  // A folder entry also wraps its open content, so center its header row only.
  function scrollToMatch(match) {
    const entry = findEntryElement(toEntryKey(match))
    const header = entry?.querySelector('.path-tree-view-entry__header') ?? entry
    header?.scrollIntoView?.({ block: 'center', behavior: 'instant' })
  }

  // Opened folders grow with a height animation that moves the match while it
  // runs, so scroll to it again once the animation ends.
  function scrollToMatchAfterExpand(match) {
    const scrollOnExpanded = (event) => {
      if (event.propertyName !== 'height') {
        return
      }
      stopScrollAfterExpand()
      scrollToMatch(match)
    }
    toValue(root)?.addEventListener('transitionend', scrollOnExpanded)
    stopScrollAfterExpand = () => toValue(root)?.removeEventListener('transitionend', scrollOnExpanded)
  }

  async function revealMatch(match) {
    stopScrollAfterExpand()
    if (!match) {
      return
    }
    const hasOpenedFolders = openFolders(match.ancestors)
    if (match.type === 'document') {
      showDocumentPage(match)
    }
    await nextTick()
    scrollToMatch(match)
    if (hasOpenedFolders) {
      scrollToMatchAfterExpand(match)
    }
  }

  watch(tree, reset, { immediate: true })
  watch(activeMatch, revealMatch)
  watch(activeKey, moveActiveKey)
  onBeforeUnmount(() => stopScrollAfterExpand())

  return { openPaths, activeKeys, activeKey, limits, toggle, showMore }
}
