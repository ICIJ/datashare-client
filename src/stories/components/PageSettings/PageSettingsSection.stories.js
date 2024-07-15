import PageSettingsSectionGroup from '@/components/PageSettings/PageSettingsSectionGroup'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'

export default {
  title: 'Components/PageSettings/Section',
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['radio', 'checkbox']
    }
  },
  render: (args) => ({
    components: {
      PageSettingsSection,
      PageSettingsSectionGroup
    },
    setup: () => {
      return { args }
    },
    template: `
        <page-settings-section  v-bind="args" v-model:open="args.open"></page-settings-section>

        Selection: {{args.modelValue}}<br/>
        Open: <b/>{{args.open}}
    `
  })
}
const props = {
  label: 'Show in document details',
  name: 'document-details',
  type: 'checkbox',
  open: true,
  options: [
    {
      value: 'thumbnail',
      text: 'Thumbnail',
      icon: 'image-square'
    },
    {
      value: 'path',
      text: 'Path',
      icon: 'tree-structure'
    },
    {
      value: 'creation-date',
      text: 'Creation date',
      icon: 'calendar-blank'
    },
    {
      value: 'highlight',
      text: 'Highlight',
      icon: 'quotes'
    }
  ]
}
export const Default = {
  args: {
    ...props,
    modelValue: []
  }
}
export const Radio = {
  args: {
    ...props,
    type: 'radio',
    modelValue: ''
  }
}
