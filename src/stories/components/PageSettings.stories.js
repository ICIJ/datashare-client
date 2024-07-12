import PageSettings from '@/components/PageSettings'
import PageSettingsSection from '@/components/PageSettingsSection'

export default {
  title: 'Components/PageSettings',
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['radio','checkbox']
    },
  },
  render: (args) => ({
    components: {
      PageSettings,PageSettingsSection
    },
    setup: () => {
      return {args}
    },
    template: `
      <page-settings :title="args.label" >
        <page-settings-section v-bind="args.sections[0]"/>
        <page-settings-section v-bind="args.sections[1]"/>
        <page-settings-section v-bind="args.sections[2]"/>
        <page-settings-section v-bind="args.sections[3]"/>
      </page-settings>

      Selection {{args.modelValue}}
    `
  })
}
const props1 = {
  label: 'Show in document details',
  name:'document-details',
  type:"radio",
  modelValue:'Most relevant',
  open:false,
  options:[
    {text:"Most relevant",value:'Most relevant'},
    {text:"Less relevant",value:'Less relevant'},
    {text:"Creation date (new)",value:'Creation date'},
    {text:"Creation date (old)",value:'Creation date'},
    {text:"Size (decreasing)",value:'Size'},
    {text:"Size (increasing)",value:'Size'},
    {text:"File path (A to Z)",value:'File path'},
    {text:"File path (Z to A)",value:'File path'},
    {text:"Indexing date (new)",value:'Indexing date'},
    {text:"Indexing date (old)",value:'Indexing date'},
  ]}
const props2 = {
  label: 'Documents per page',
  name:'test',
  type:"radio",
  modelValue:'30',
  open:true,
  options:[
    {
      value: "10",
      text: "10",
    },
    {
      value: "20",
      text: "20",
    },
    {
      value: "30",
      text: "30",
    },
  ]}
const props3 = {
  label: 'View',
  name:'view',
  type:"radio",
  modelValue:'grid',
  open:true,
  options:[
    {
      value: "grid",
      text: "Grid",
      icon: 'image-square'
    },
    {
      value: "list",
      text: "List",
      icon: 'tree-structure'
    },
    {
      value: "table",
      text: "Table",
      icon: 'calendar-blank'
    }
  ]}
const props4 = {
  label: 'Document details',
  name:'document-details',
  type:"checkbox",
  modelValue:["thumbnail","creation-date"],
  open:true,
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




const sections = [props1,props2, props3,props4]
export const Default = {
  args: {
    title:"Page settings",
    sections:sections,
  }
}
