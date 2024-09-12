import PageContainer from '@/components/PageContainer/PageContainer'
import { SIZE } from '@/enums/sizes'

export default {
  tags: ['autodocs'],
  title: 'Components/PageContainer/PageContainer',
  component: PageContainer,
  argTypes: {
    fluid: Boolean,
    compactBreakpoint: String,
    default: String
  },
  args: {
    fluid: true,
    compactBreakpoint: SIZE.MD,
    default: `
      Container are the most basic layout element in Bootstrap and are required when
      using our default grid system. We enhanced it with some responsive horiztonal padding
      so they can use a small amount of space on the sides of the screen depending of
      the given "compactBreakpoint" property.
    `.replace(/\n+/g, ' ')
  },
  parameters: {
    slots: {
      default: `Default slot content of the container`
    }
  },
  decorators: [
    () => ({
      template: `
        <div class="text-bg-light">
          <story class="border py-5" />
        </div>
      `
    })
  ]
}

export const Default = {}
