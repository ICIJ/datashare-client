import DisplayStatusProgress from '@/components/Display/DisplayStatusProgress'
import { variantsPlainArgType } from '~storybook/utils'

export default {
  title: 'Components/Display/DisplayStatusProgress',
  tags: ['autodocs'],
  component: DisplayStatusProgress,
  argTypes: {
    fixedWidth: {
      control: 'boolean'
    },
    status: {
      control: 'select',
      options: ['queued', 'success', 'failure', 'draft']
    },
    statusVariant: variantsPlainArgType,
    progress: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 }
    },
    progressVariant: variantsPlainArgType
  },
  args: {
    fixedWidth: true,
    status: 'queued',
    statusVariant: undefined,
    statusIcon: undefined,
    statusTitle: undefined,
    progress: 0.5,
    progressVariant: undefined
  }
}

export const Default = {}
