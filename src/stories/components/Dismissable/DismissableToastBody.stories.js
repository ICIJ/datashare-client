import { h } from 'vue'
import { toast } from 'vue3-toastify'

import ToastBody from '@/components/Dismissable/DismissableToastBody'
import { variantsPlainArgType } from '~storybook/utils'
import { VARIANT } from '@/enums/variants'

export default {
  title: 'Components/Dismissable/DismissableToastBody',
  tags: ['autodocs'],
  component: ToastBody,
  argTypes: {
    variant: variantsPlainArgType,
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
    variant: VARIANT.INFO,
    body: 'Indexing task to add documents launched.',
    href: '#/tasks/',
    title: null,
    autoClose: false
  },
  render: args => ({
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
        <button class="btn btn-action" @click="toast()">
          Show toast
        </button>
      </div>
    `
  })
}

export const Default = {}
