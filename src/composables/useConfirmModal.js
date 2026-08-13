import { h } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import AppModalConfirm from '@/components/AppModal/AppModalConfirm'

export const useConfirmModal = (Component = AppModalConfirm) => {
  const { create, hide } = useModal()

  function show({ okCallback = null, ...props } = {}) {
    return new Promise((resolve) => {
      let pending = false

      // The prevented "ok" event below is still followed by a "hide" event: while the
      // callback is pending, that event must not resolve the promise or close the modal.
      const resolveUnlessPending = (event) => {
        if (!pending) {
          resolve(event)
        }
      }

      // When an okCallback is given, confirming keeps the modal open with a loading ok
      // button and a disabled cancel button until the callback settles, then hides it.
      const onOk = async (event) => {
        if (!okCallback) {
          return resolve(event)
        }
        event.preventDefault()
        if (pending) {
          return
        }
        pending = true
        modal.set({ okLoading: true, cancelDisabled: true, noCloseOnBackdrop: true, noCloseOnEsc: true })
        try {
          await okCallback()
        }
        finally {
          pending = false
          resolve(event)
          modal.hide('ok')
        }
      }

      const component = h(Component, {
        onOk,
        onClose: resolveUnlessPending,
        onHide: resolveUnlessPending,
        onCancel: resolveUnlessPending
      })

      const modal = create({ component, ...props })
      modal.show()
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
