import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useTaskSettings() {
  const { t } = useI18n()

  const propertiesOrder = ['id', 'name', 'createdAt', 'progress', 'result', 'state']

  const propertiesLabel = computed(() => {
    return {
      id: 'id',
      name: 'name',
      createdAt: 'createdAt',
      progress: 'progress',
      result: 'result',
      state: 'state'
    }
  })

  const propertiesIcon = {
    id: 'image',
    name: 'file-text',
    createdAt: 'quotes',
    progress: 'user-circle',
    result: 'tree-structure',
    state: 'hash'
  }

  return { propertiesOrder, propertiesLabel, propertiesIcon }
}
