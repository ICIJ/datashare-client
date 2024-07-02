import { PhX } from '@phosphor-icons/vue'
import { h } from 'vue'
import { toast } from 'vue3-toastify'

import ToastBody from '@/components/ToastBody'

export default {
  title: 'Components/ToastBody',
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark']
    },
    body: {
      control: { type: 'text' }
    },
    title: {
      control: { type: 'text' }
    }
  },
  args: {
    variant: 'info',
    body: 'A simple toast message'
  },
  render: (args) => ({
    methods: {
      toast() {
        const closeButton = () => h(PhX, { class: 'align-self-center', weight: 'bold' })
        const toastProps = { type: args.variant, icon: false, closeButton }
        toast?.(({ closeToast, toastProps }) => h(ToastBody, { closeToast, toastProps, ...args }), toastProps)
      }
    },
    template: `
      <button class="btn btn-primary" @click="toast()">
        Show toast
      </button>
    `
  })
}

export const Default = { }
