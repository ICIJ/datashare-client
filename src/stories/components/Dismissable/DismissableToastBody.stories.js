import { PhX } from '@phosphor-icons/vue'
import { h } from 'vue'
import { toast } from 'vue3-toastify'

import ToastBody from '@/components/Dismissable/DismissableToastBody'

export default {
  title: 'Components/Dismissable/ToastBody',
  tags: ['autodocs'],
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
    },
    autoClose: {
      control: { type: 'boolean' }
    }
  },
  args: {
    variant: 'info',
    body: 'A simple toast message',
    title: null,
    autoClose: false
  },
  render: (args) => ({
    methods: {
      toast() {
        toast?.(({ closeToast, toastProps }) => h(ToastBody, { closeToast, toastProps, ...args }), this.toastProps)
      }
    },
    computed: {
      type() {
        return args.variant
      },
      autoClose() {
        return args.autoClose === false ? false : 5000
      },
      body() {
        return args.body
      },
      toastProps() {
        const closeButton = () => h(PhX, { class: 'align-self-center', weight: 'bold' })
        return { type: this.type, autoClose: this.autoClose, icon: false, closeButton }
      }
    },
    template: `
      <div class="card card-body d-block">
        <button class="btn btn-primary" @click="toast()">
          Show toast
        </button>
      </div>
    `
  })
}

export const Default = {}
