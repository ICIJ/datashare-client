import ButtonToggleFileTypesGrouped from '@/components/Button/ButtonToggleFileTypesGrouped'

export default {
  tags: ['autodocs'],
  title: 'Components/Button/ButtonToggleFileTypesGrouped',
  component: ButtonToggleFileTypesGrouped,
  args: {
    grouped: false
  }
}

export const Default = {}

export const Grouped = {
  args: {
    grouped: true
  }
}
