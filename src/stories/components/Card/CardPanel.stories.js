import CardPanel from '@/components/CardPanel/CardPanel'

export default {
  title: 'Components/CardPanel/CardPanel',
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
