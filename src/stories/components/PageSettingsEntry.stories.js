import PageSettingsEntry from '@/components/PageSettingsEntry'

export default {
  title: 'Components/PageSettings/Entry',
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['radio','checkbox']
    }
  },
  render: (args) => ({
    components: {
      PageSettingsEntry
    },
    setup: () => ({ args }),
    template: `
      <page-settings-entry v-bind="args"/>
    `
  })
}

export const Radio = {
  args: {
    type: 'radio',
    modelValue: true,
    text: "Path",
    icon: 'tree-structure'
  }
}
export const Checkbox = {
  args: {
    type: 'checkbox',
    modelValue:true,
    text: "Path",
    icon: 'tree-structure'
  }
}
export const SlotContent = {
  args: {
    type: 'checkbox',
    modelValue: true,
    text: "Path",
    name: "path",
    icon: 'tree-structure'
  },
  render: (args) => ({
    components: {
      PageSettingsEntry
    },
    setup: () => ({ args }),
    template: `
      <page-settings-entry :type="args.type"
                           :icon="args.icon"
                           :text="args.text"
                           :name="args.path"
                           v-model="args.modelValue">

        Original content {{ args.modelValue }}
      </page-settings-entry>
    `
  })
}
