import { PhosphorIcon } from '@icij/murmur-next'

import CardPanel from '@/components/Card/CardPanel'

export default {
  components: {},
  title: 'Components/Card/CardPanel',
  tags: ['autodocs'],
  component: CardPanel,
  parameters: {
    slots: {
      default: {
        description: 'Default slot'
      }
    }
  },
  args: {
    icon: '',
    title: 'Generic card title',
    default: 'Default slot'
  }
}
export const Default = {}
