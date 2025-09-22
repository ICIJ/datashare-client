import PathTreePlaceholder from '@/components/PathTree/PathTreePlaceholder/PathTreePlaceholder'
import { LAYOUTS } from '@/enums/pathTree'

export default {
  title: 'Components/PathTree/PathTreePlaceholder/PathTreePlaceholder',
  tags: ['autodocs'],
  component: PathTreePlaceholder,
  argTypes: {
    compact: Boolean,
    entries: {
      control: {
        type: 'number',
        min: 1,
        max: 100,
        step: 1
      }
    },
    layout: {
      control: 'select',
      options: Object.values(LAYOUTS)
    },
    level: {
      control: {
        type: 'number',
        min: 0,
        max: 10,
        step: 1
      }
    }
  },
  args: {
    compact: false,
    layout: LAYOUTS.TREE,
    level: 0,
    entries: 6,
    noStats: false
  }
}

export const Default = {}
