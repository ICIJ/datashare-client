import { computed } from 'vue'

import { useCore } from '@/composables/core'
import { MODE_NAME } from '@/mode'

export function useUtils() {
  const { core } = useCore()

  const termIndexColors = ['#ECFC7A', '#CDFD94', '#A8FDAC', '#52FDEA']
  function getTermIndexColor(index) {
    return termIndexColors[index % termIndexColors.length]
  }
  function getTermIndexBorderColor(index) {
    return { 'border-color': getTermIndexColor(index) }
  }
  function getTermIndexBackgroundColor(index) {
    return { 'background-color': getTermIndexColor(index) }
  }
  function isNotLastArrayItem(index, arrayLength) {
    return index < arrayLength - 1
  }

  const isServer = computed(() => {
    return core.config?.get('mode') === MODE_NAME.SERVER
  })

  return {
    isServer,
    getTermIndexColor,
    getTermIndexBorderColor,
    getTermIndexBackgroundColor,
    isNotLastArrayItem
  }
}
