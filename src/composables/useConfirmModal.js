import { h } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import AppModalConfirm from '@/components/AppModal/AppModalConfirm'

export const useConfirmModal = (Component = AppModalConfirm) => {
  const { create, hide } = useModal()

  function show(props = {}) {
    return new Promise((resolve) => {
      const component = h(Component, {
        onOk: resolve,
        onClose: resolve,
        onHide: resolve,
        onCancel: resolve
      })

      create({ component, ...props }).show()
    })
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
