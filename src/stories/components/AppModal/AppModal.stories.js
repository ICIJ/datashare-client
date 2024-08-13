import AppModal from '@/components/AppModal/AppModal'
import ImageModeSource from '@/components/ImageMode/ImageModeSource'
import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'

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
    image,
    imageDark,
    title: 'Are you sure?',
    default: 'Let’s explain here the consequences of the action if needed so users don’t make any mistake.',
    imageWidth: '60px',
    bodyClass: 'text-secondary-emphasis',
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
      components: {
        AppModal,
        ImageModeSource
      },
      template: `
        <button class="btn btn-action" @click="args.modelValue = !args.modelValue">
          Toggle modal
        </button>
        <app-modal v-bind="args" @update:modelValue="args.modelValue = $event">
          {{ args.default }}
          <template #header-image-source>
            <image-mode-source :src="args.imageDark" color-mode="dark" />
          </template>
        </app-modal>
      `,
      data() {
        return { args }
      }
    }
  }
}

export const Default = {}
