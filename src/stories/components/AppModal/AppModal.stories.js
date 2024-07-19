import AppModal from '@/components/AppModal/AppModal'
import { ArgTypes } from '@storybook/blocks'

export default {
  title: 'Components/AppModal/AppModal',
  tags: ['autodocs'],
  component: AppModal,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl']
    }
  },
  args: {
    title: 'Are you sure?',
    default: 'Let’s explain here the consequences of the action if needed so users don’t make any mistake.',
    image: 'https://i.imgur.com/1eWgPCp.png',
    imageWidth: '60px',
    modelValue: true,
    fullscreen: false,
    hideBackdrop: false,
    hideFooter: false,
    hideHeader: false,
    size: 'md'
  },
  parameters: {
    slots: {
      default: `Default slot content`
    }
  },
  render(args) {
    return {
      components: { AppModal },
      template: `
        <button class="btn btn-primary" @click="args.modelValue = !args.modelValue">
          Toggle modal
        </button>
        <app-modal v-bind="args" @update:modelValue="args.modelValue = $event">
          {{ args.default }}
        </app-modal>
      `,
      data() {
        return { args }
      }
    }
  }
}

export const Default = {}
