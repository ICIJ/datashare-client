import { h, computed } from 'vue'
import { useModalController } from 'bootstrap-vue-next'
import { useI18n } from 'vue-i18n'

import BatchSearchErrorModal from '@/components/BatchSearch/BatchSearchErrorModal'

export function useBatchSearchErrorModal() {
  const modalController = useModalController()
  const { t } = useI18n()
  const okTitle = computed(() => t('batchSearchErrorModal.okTitle'))
  const errorTitle = computed(() => t('batchSearchErrorModal.errorTitle'))
  const href = '#'
  const text = computed(() => t('batchSearchErrorModal.text'))
  const description = computed(() =>
    t('batchSearchErrorModal.description', {
      link: `<a href="${href}" target="_blank" rel="noopener">${text.value}</a>`
    })
  )

  function show(errorMessage, query) {
    const props = {
      okTitle,
      errorTitle,
      errorMessage,
      query,
      description
    }

    return new Promise((resolve) => {
      const component = h(BatchSearchErrorModal, {
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve
      })

      modalController.show({ component, props })
    })
  }

  function hide() {
    return modalController.hide()
  }

  return { show, hide }
}
