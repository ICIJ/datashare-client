import { h } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import AppModalPrompt from '@/components/AppModal/AppModalPrompt'

export const usePromptModal = (Component = AppModalPrompt) => {
  const { create, hide } = useModal()

  function show(props = { inputAutofocus: true }) {
    return new Promise((resolve) => {
      const component = h(Component, {
        onClose: resolve,
        onHide: resolve,
        onCancel: resolve,
        onSubmit: resolve
      })

      create({ component, ...props }).show()
    })
  }

  async function prompt(props) {
    const { trigger, ...rest } = await show(props)
    return trigger === 'submit' ? rest : null
  }

  return { show, hide, prompt }
}
