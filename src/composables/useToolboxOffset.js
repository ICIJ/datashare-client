import { computed, toValue } from 'vue'

/**
 * Exposes the height of a sticky `DocumentToolbox` so the content under it can be offset.
 *
 * @param {import('vue').MaybeRefOrGetter<object|null>} toolbox - The toolbox component instance.
 * @returns {Object} `{ toolboxHeight, toolboxStyle }`
 */
export function useToolboxOffset(toolbox) {
  const toolboxHeight = computed(() => toValue(toolbox)?.height ?? 0)
  const toolboxStyle = computed(() => ({ '--document-toolbox-height': `${toolboxHeight.value}px` }))
  return { toolboxHeight, toolboxStyle }
}
