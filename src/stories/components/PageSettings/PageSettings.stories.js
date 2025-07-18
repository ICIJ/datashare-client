import { BCloseButton } from 'bootstrap-vue-next'
import { fn } from 'storybook/test'

import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { INPUT_CHECKBOX, INPUT_RADIO } from '@/composables/useViewSettings'

export default {
  title: 'Components/PageSettings',
  tags: ['autodocs'],
  component: PageSettings,
  render: (args) => ({
    components: {
      PageSettings,
      PageSettingsSection,
      BCloseButton
    },
    setup: () => {
      return { args }
    },
    template: `
      <page-settings title="Page settings">
        <template #closeButton>
          <b-close-button class="d-inline-flex" @click="args.onCloseButtonClick"/>
        </template>
        <page-settings-section
          v-model="args.example.modelValue"
          v-model:open="args.example.open"
          :type="args.example.type"
          :options="args.example.options"
          :label="args.example.label"
          :name="args.example.name"
        />
        <page-settings-section
          v-for="(section,index) in args.sections"
          :key="index"
          v-model="section.modelValue"
          v-model:open="section.open"
          :type="section.type"
          :options="section.options"
          :label="section.label"
          :name="section.name"
        />
      </page-settings>
      <hr/>
      <ul>
      <li   v-for="(section) in [args.example,...args.sections]"
      >"{{section.label}}": open:{{ section.open }}, modelValue: <b>{{section.modelValue}}</b></li>
      </ul>
    `
  })
}

const example = {
  label: 'Show in document details',
  name: 'document-details',
  type: INPUT_RADIO,
  modelValue: 'less-relevant',
  open: false,
  options: [
    { text: 'Most relevant', value: 'most-relevant' },
    { text: 'Less relevant', value: 'less-relevant' },
    { text: 'Creation date (recent first)', value: 'creation-date-new' },
    { text: 'Creation date (old first)', value: 'creation-date-old' },
    { text: 'Size (decreasing)', value: 'size-decreasing' },
    { text: 'Size (increasing)', value: 'size-increasing' },
    { text: 'File path (A to Z)', value: 'file-path' },
    { text: 'File path (Z to A)', value: 'file-path' },
    { text: 'Indexing date (recent first)', value: 'indexing-date-new' },
    { text: 'Indexing date (old first)', value: 'indexing-date-old' }
  ]
}
const props2 = {
  label: 'Documents per page',
  name: 'test',
  type: INPUT_RADIO,
  modelValue: '30',
  open: true,
  options: [
    {
      value: '10',
      text: '10'
    },
    {
      value: '20',
      text: '20'
    },
    {
      value: '30',
      text: '30'
    }
  ]
}
const props3 = {
  label: 'View',
  name: 'view',
  type: INPUT_RADIO,
  modelValue: 'grid',
  open: true,
  options: [
    {
      value: 'grid',
      text: 'Grid',
      icon: 'image-square'
    },
    {
      value: 'list',
      text: 'List',
      icon: 'tree-structure'
    },
    {
      value: 'table',
      text: 'Table',
      icon: 'calendar-blank'
    }
  ]
}
const props4 = {
  label: 'Document details',
  name: 'document-details',
  type: INPUT_CHECKBOX,
  modelValue: ['thumbnail', 'creation-date'],
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

const sections = [props2, props3, props4]
export const Default = {
  args: {
    title: 'Page settings',
    example,
    sections,
    onCloseButtonClick: fn()
  }
}
