import { h } from 'vue'
import { toast } from 'vue3-toastify'

import ToastBody from '@/components/Dismissable/DismissableToastBody'

export default {
  title: 'Components/Dismissable/DismissableToastBody',
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
    },
    href: {
      control: { type: 'text' }
    }
  },
  args: {
    variant: 'info',
    body: 'Indexing task to add documents launched.',
    href: '#/tasks/',
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
        return { type: this.type, autoClose: this.autoClose, icon: false, closeButton: false }
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
