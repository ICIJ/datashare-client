import DocumentMetadata from '@/components/Document/DocumentMetadata/DocumentMetadata'
import DisplayContentLength from '@/components/Display/DisplayContentLength'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import DisplayLanguage from '@/components/Display/DisplayLanguage'
import ProjectButton from '@/components/Project/ProjectButton'

export default {
  title: 'Components/Document/DocumentMetadata/DocumentMetadata',
  component: DocumentMetadata,
  tags: ['autodocs'],
  args: {
    pinned: false,
    label: 'Document directory',
    value: '/vault/luxleaks/v1/2001 and before',
    icon: markRaw(IPhFolderOpen),
    description: 'The document directory is the path to the document in Datashare.'
  },
  render: args => ({
    components: {
      DocumentMetadata
    },
    setup: () => ({ args }),
    template: `
      <document-metadata v-bind="args" @update:pinned="args.pinned = $event">
        {{ args.value }}
      </document-metadata>
    `
  })
}

export const Default = {}

export const WithDatetime = {
  args: {
    label: 'Created',
    value: '2021-01-01T00:00:00Z',
    icon: markRaw(IPhCalendarBlank)
  },
  render: args => ({
    components: {
      DocumentMetadata,
      DisplayDatetime
    },
    setup: () => ({ args }),
    template: `
      <document-metadata v-bind="args" @update:pinned="args.pinned = $event">
        <display-datetime :value="args.value" format="long" />
      </document-metadata>
    `
  })
}

export const WithContentLength = {
  args: {
    label: 'File size',
    value: 123456,
    icon: markRaw(IPhFloppyDiskBack)
  },
  render: args => ({
    components: {
      DocumentMetadata,
      DisplayContentLength
    },
    setup: () => ({ args }),
    template: `
      <document-metadata v-bind="args" @update:pinned="args.pinned = $event">
        <display-content-length :value="args.value" />
      </document-metadata>
    `
  })
}

export const WithProjectButton = {
  args: {
    label: 'Project',
    value: 'Luxleaks',
    icon: markRaw(IPhCirclesThreePlus)
  },
  render: args => ({
    components: {
      DocumentMetadata,
      ProjectButton
    },
    setup: () => ({ args }),
    template: `
      <document-metadata v-bind="args" @update:pinned="args.pinned = $event">
        <project-button :project="args.value" size="sm" />
      </document-metadata>
    `
  })
}

export const WithLanguage = {
  args: {
    label: 'Content language',
    value: 'CHINESE',
    icon: markRaw(IPhGlobeHemisphereWest)
  },
  render: args => ({
    components: {
      DocumentMetadata,
      DisplayLanguage
    },
    setup: () => ({ args }),
    template: `
      <document-metadata v-bind="args" @update:pinned="args.pinned = $event">
        <display-language :value="args.value" />
      </document-metadata>
    `
  })
}
