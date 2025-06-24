import { h } from 'vue'
import { useModalController } from 'bootstrap-vue-next'

import AppModalPrompt from '@/components/AppModal/AppModalPrompt'

export const usePromptModal = (Component = AppModalPrompt) => {
  const modalController = useModalController()

  function show(props = { inputAutofocus: true }) {
    return new Promise((resolve) => {
      const component = h(Component, {
        onClose: resolve,
        onHide: resolve,
        onCancel: resolve,
        onSubmit: resolve
      })

      modalController.create({ component, props })
    })
  }

  function hide() {
    return modalController.hide()
  }

  async function prompt(props) {
    const { trigger, ...rest } = await show(props)
    return trigger === 'submit' ? rest : null
  }

  return { show, hide, prompt }
}
