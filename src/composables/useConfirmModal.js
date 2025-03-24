import { h } from 'vue'
import { useModalController } from 'bootstrap-vue-next'

import AppModalConfirm from '@/components/AppModal/AppModalConfirm'

export const useConfirmModal = (Component = AppModalConfirm) => {
  const modalController = useModalController()

  function show(props = {}) {
    return new Promise((resolve) => {
      const component = h(Component, {
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

  async function afterConfirmation(callback, props) {
    return (await confirm(props)) && callback()
  }

  return { show, hide, confirm, afterConfirmation }
}
