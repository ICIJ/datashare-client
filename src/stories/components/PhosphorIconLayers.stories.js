import { PhosphorIcon, PhosphorIconLayers } from '@icij/murmur-next'

export default {
  title: 'Components/Phosphor/IconLayers',
  tags: ['autodocs'],
  components: PhosphorIconLayers,
  argTypes: {
    weight: {
      control: { type: 'select' },
      options: ['thin', 'light', 'regular', 'bold', 'fill', 'duotone']
    }
  },
  args: {
    weight: 'regular',
    spin: false,
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
