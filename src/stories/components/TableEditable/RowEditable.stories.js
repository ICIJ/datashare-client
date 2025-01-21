import RowEditable from '@/components/TableEditable/RowEditable.vue'

export default {
  title: 'Components/TableEditable/RowEditable',
  component: RowEditable,
  tags: ['autodocs'],
  args: {
    modelValue: ''
  }
}

export const Default = {}

export const WithValue = {
  args: { modelValue: 'tutu' }
}
