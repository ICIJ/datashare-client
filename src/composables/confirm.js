import { h } from 'vue'
import { useModalController } from 'bootstrap-vue-next'

import AppModalConfirm from '@/components/AppModal/AppModalConfirm'

export const useConfirmModal = () => {
  const modalController = useModalController()
  
  function show(props = {}) {
    return new Promise((resolve) => {
      const component = h(AppModalConfirm, {
        onOk: resolve,
        onClose: resolve,
        onHide: resolve,
        onCancel: resolve
      })

      modalController.show({ component, props })
    })
  }

  function hide() {
    return modalController.hide()
  }

  async function confirm(props) {
    const { trigger } = await show(props)
    return trigger === 'ok'
  }

  return { show, hide, confirm }
}