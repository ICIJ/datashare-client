import { PhosphorIcon, PhosphorIconLayers } from '@icij/murmur-next'

export default {
  title: 'Components/PhosphorIcon/PhosphorIconLayers',
  tags: ['autodocs'],
  components: PhosphorIconLayers,
  argTypes: {
    size: {
      control: { type: 'string' }
    }
  },
  args: {
    size: '44px'
  },
  render: (args) => ({
    components: {
      PhosphorIcon,
      PhosphorIconLayers
    },
    setup() {
      return {
        args
      }
    },
    template: `
      <phosphor-icon-layers v-bind="args">
        <phosphor-icon name="arrow-counter-clockwise" spin-reverse v-bind="args" />
        <phosphor-icon name="arrow-clockwise" size="1.1em" variant="secondary" spin weight="bold" />
      </phosphor-icon-layers>
    `
  })
}

export const Default = {}
