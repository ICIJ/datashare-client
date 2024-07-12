import PageSettingsSectionLabel from '@/components/PageSettingsSectionLabel'
import PageSettingsSection from '@/components/PageSettingsSection'
import {ref} from "vue";

export default {
  title: 'Components/PageSettings/Section',
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['radio','checkbox']
    },
  },
  render: (args) => ({
    components: {
      PageSettingsSection,PageSettingsSectionLabel
    },
    setup: () => {
      const selected = ref("")
      return {selected,args}
    },
    template: `
      <page-settings-section-label :title="args.label" v-slot="{open}">
        <page-settings-section v-show="open" v-bind="args"></page-settings-section>
      </page-settings-section-label>

      Selection {{args.modelValue}}
    `
  })
}
const props = {label: 'Show in document details',
  name:'document-details',
  type:"checkbox",
  options:[
    {
      value: "thumbnail",
      text: "Thumbnail",
      icon: 'image-square'
    },
    {
      value: "path",
      text: "Path",
      icon: 'tree-structure'
    },
    {
      value: "creation-date",
      text: "Creation date",
      icon: 'calendar-blank'
    },
    {
      value: "highlight",
      text: "Highlight",
      icon: 'quotes'
    }
  ]}
export const Default = {
  args: {
    ...props,modelValue:[]
  }
}
export const Radio = {
  args: {
    ...props,type:"radio",modelValue:''
  }
}
