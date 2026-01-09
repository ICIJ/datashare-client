import { AppIcon, AppIconLayers } from '@icij/murmur-next'

export default {
  title: 'Components/Murmur/AppIconLayers',
  tags: ['autodocs'],
  component: AppIconLayers,
  argTypes: {
    size: {
      control: { type: 'string' }
    }
  },
  args: {
    size: '44px'
  },
  render: args => ({
    components: {
      AppIcon,
      AppIconLayers
    },
    setup() {
      return {
        args
      }
    },
    template: `
      <app-icon-layers v-bind="args">
        <app-icon spin-reverse v-bind="args">
          <i-ph-arrow-counter-clockwise />
        </app-icon>
        <app-icon size="1.1em" variant="primary" spin>
          <i-ph-arrow-clockwise-bold />
        </app-icon>
      </app-icon-layers>
    `
  })
}

export const Default = {}
