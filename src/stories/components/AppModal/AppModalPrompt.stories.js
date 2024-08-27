import { breakpointSizeArgType, inputTypeArgType } from '~storybook/utils'
import AppModalPrompt from '@/components/AppModal/AppModalPrompt'
import ImageModeSource from '@/components/ImageMode/ImageModeSource'
import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
export default {
  components: { AppModalPrompt },
  title: 'Components/AppModal/AppModalPrompt',
  tags: ['autodocs'],
  component: AppModalPrompt,
  argTypes: {
    size: breakpointSizeArgType,
    inputType: inputTypeArgType
  },
  args: {
    image,
    imageDark,
    modelValue: false,
    inputValue: 'test',
    inputAutofocus: false
  },
  render(args) {
    return {
      components: {
        AppModalPrompt,
        ImageModeSource
      },
      template: `
        <button class="btn btn-action" @click="args.modelValue = !args.modelValue">
          Toggle modal
        </button>
        <app-modal-prompt v-bind="args" :model-value="args.modelValue" @update:modelValue="args.modelValue = $event" @submit="onSubmit">
          <template #header-image-source>
            <image-mode-source :src="args.imageDark" color-mode="dark" />
          </template>
          {{ args.default }}
        </app-modal-prompt>
      `,
      data() {
        const onSubmit = ({ value }) => {
          console.log('submitted text', value)
        }
        return { args, onSubmit }
      }
    }
  }
}

export const Default = {
  args: {
    title: 'Name your saved search',
    okTitle: 'Save search',
    cancelTitle: 'Cancel',
    inputValue: '',
    inputPlaceholder: 'Type here',
    description: 'You will find your saved searches in the left menu in Explore > Saved Searches'
  }
}
export const Autofocus = {
  args: {
    title: 'Name your saved search',
    okTitle: 'Save search',
    cancelTitle: 'Cancel',
    inputValue: '',
    inputAutofocus: true,
    inputPlaceholder: 'Type here',
    description: 'You will find your saved searches in the left menu in Explore > Saved Searches'
  }
}
export const InputError = {
  args: {
    title: 'Name your alert',
    okTitle: 'Create alert',
    cancelTitle: 'Cancel',
    inputValue: 'bad alert name',
    inputPlaceholder: 'Type here',
    description: 'You will find your saved searches in the left menu in Explore > Alerts',
    inputState: false,
    inputInvalidFeedback: 'Invalid alert name'
  }
}
