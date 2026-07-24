import PageSettingsSectionGroup from '@/components/PageSettings/PageSettingsSectionGroup'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { INPUT_CHECKBOX } from '@/composables/useViewSettings'

export default {
  title: 'Components/PageSettings/Section',
  tags: ['autodocs'],
  component: PageSettingsSection,
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: [INPUT_CHECKBOX, INPUT_CHECKBOX]
    }
  },
  render: args => ({
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
  type: INPUT_CHECKBOX,
  open: true,
  options: [
    {
      value: 'thumbnail',
      text: 'Thumbnail',
      icon: markRaw(IPhImageSquare)
    },
    {
      value: 'path',
      text: 'Path',
      icon: markRaw(IPhTreeStructure)
    },
    {
      value: 'creation-date',
      text: 'Creation date',
      icon: markRaw(IPhCalendarBlank)
    },
    {
      value: 'highlight',
      text: 'Highlight',
      icon: markRaw(IPhQuotes)
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
    type: INPUT_CHECKBOX,
    modelValue: ''
  }
}
