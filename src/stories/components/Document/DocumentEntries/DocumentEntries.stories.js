import { markRaw } from 'vue'
import { PhFile, PhFilePdf, PhFileCsv, PhFilePpt, PhFileDoc, PhFileXls, PhFileTxt } from '@phosphor-icons/vue'
import { vueRouter } from 'storybook-vue3-router'
import { BPlaceholderTable } from 'bootstrap-vue-next'

import { layoutArgType } from '~storybook/utils'
import { withMurmur } from '~storybook/decorators/murmur'
import { LAYOUTS } from '@/enums/layouts'
import DocumentEntries from '@/components/Document/DocumentEntries/DocumentEntries'

const routes = [
  {
    path: '/',
    name: 'document'
  },
  {
    path: '/project/:name',
    name: 'project.view'
  }
]

export default {
  title: 'Components/Document/DocumentEntries/DocumentEntries',
  decorators: [withMurmur({ previewHost: null }), vueRouter(routes)],
  component: DocumentEntries,
  argTypes: {
    entries: {
      type: Array
    },
    properties: {
      control: 'check',
      options: [
        'title',
        'thumbnail',
        'path',
        'author',
        'highlights',
        'creationDate',
        'contentLength',
        'contentTextLength',
        'contentType',
        'language',
        'extractionLevel',
        'tags',
        'project'
      ]
    },
    layout: layoutArgType
  },
  parameters: {
    slots: {
      default: {
        description: `Default slot content`,
        components: { BPlaceholderTable },
        template: `
          <div class="w-100 px-5">
            <h1 class="h4 fw-bold">{{ args.default }}</h1>
            <b-placeholder-table animation="wave" />
          </div>
        `
      }
    }
  },
  args: {
    default: 'A document',
    selected: [],
    layout: LAYOUTS.LIST,
    properties: ['title', 'thumbnail', 'path'],
    total: 152,
    perPage: 25,
    selectMode: false,
    page: 1,
    entries: [
      {
        title: 'Inter IKEA Investment S.à r.l._cover letter 2010-2011 tax returns.pdf',
        extractionLevel: 0,
        author: 'Pierre Romera Zhang <hello@pirhoo.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/ns9ThQx.jpeg',
        tags: ['foo', 'bar', 'baz'],
        language: 'ENGLISH',
        contentLength: 23e4,
        contentTextLength: 14e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: [
          'Lorem ispum dolor sit <mark>IKEA</mark> amet.',
          'Consectetur <mark>IKEA</mark> adipiscing elit.',
          'Sed do eiusmod tempor incididunt ut labore et <mark>IKEA</mark> dolore magna aliqua.'
        ],
        contentTypeIcon: markRaw(PhFilePdf)
      },
      {
        title: 'Tax Returns.csv',
        extractionLevel: 0,
        author: 'Pierre Romera Zhang <hello@pirhoo.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/ns9ThQx.jpeg',
        tags: ['tax'],
        language: 'ENGLISH',
        contentLength: 3e4,
        contentTextLength: 1e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: ['Lorem ispum dolor sit <mark>TAX THE RICH</mark> amet.'],
        contentTypeIcon: markRaw(PhFileCsv)
      },
      {
        title: 'Annual Financial Statement 2015.docx',
        extractionLevel: 1,
        author: 'John Doe <john.doe@example.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/doc1.jpeg',
        tags: ['finance', 'annual', 'statement'],
        language: 'ENGLISH',
        contentLength: 120e3,
        contentTextLength: 80e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: [
          'The company achieved a <mark>profit</mark> of $2 million in 2015.',
          'Total <mark>revenue</mark> increased by 10% compared to the previous year.'
        ],
        contentTypeIcon: markRaw(PhFileDoc, PhFileXls, PhFileTxt)
      },
      {
        title: 'Employee Contract Agreement.pdf',
        extractionLevel: 2,
        author: 'Jane Smith <jane.smith@example.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/doc2.jpeg',
        tags: ['contract', 'employee', 'agreement'],
        language: 'ENGLISH',
        contentLength: 95e3,
        contentTextLength: 65e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: [
          'The <mark>employee</mark> agrees to the terms and conditions.',
          'This <mark>contract</mark> is valid for two years from the date of signing.'
        ],
        contentTypeIcon: markRaw(PhFilePdf)
      },
      {
        title: 'Project Plan.xlsx',
        extractionLevel: 0,
        author: 'Alex Johnson <alex.johnson@example.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/doc3.jpeg',
        tags: ['project', 'plan', 'excel'],
        language: 'ENGLISH',
        contentLength: 80e3,
        contentTextLength: 20e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: [
          'The <mark>project plan</mark> outlines the milestones.',
          'Resource allocation is detailed in the <mark>spreadsheet</mark>.'
        ],
        contentTypeIcon: markRaw(PhFileXls)
      },
      {
        title: 'Meeting Minutes March 2020.txt',
        extractionLevel: 1,
        author: 'Emily Davis <emily.davis@example.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/doc4.jpeg',
        tags: ['meeting', 'minutes', '2020'],
        language: 'ENGLISH',
        contentLength: 50e3,
        contentTextLength: 45e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: [
          'Discussion on <mark>budget allocation</mark> for Q2.',
          'Action items assigned to <mark>team members</mark>.'
        ],
        contentTypeIcon: markRaw(PhFileTxt)
      },
      {
        title: 'Research Paper on Quantum Computing.pdf',
        extractionLevel: 2,
        author: 'Dr. Alan Turing <alan.turing@example.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/doc5.jpeg',
        tags: ['research', 'quantum computing', 'paper'],
        language: 'ENGLISH',
        contentLength: 150e3,
        contentTextLength: 110e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: [
          'Exploring the potential of <mark>quantum algorithms</mark>.',
          'Challenges in <mark>quantum error correction</mark>.'
        ],
        contentTypeIcon: markRaw(PhFilePdf)
      },
      {
        title: 'Company Brochure 2021.indd',
        extractionLevel: 1,
        author: 'Marketing Team <marketing@example.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/doc6.jpeg',
        tags: ['brochure', 'marketing', '2021'],
        language: 'ENGLISH',
        contentLength: 100e3,
        contentTextLength: 30e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: [
          'Introducing our latest <mark>product line</mark>.',
          'Company mission and <mark>values</mark>.'
        ],
        contentTypeIcon: markRaw(PhFile)
      },
      {
        title: 'Sales Data Q1 2019.csv',
        extractionLevel: 0,
        author: 'Sales Department <sales@example.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/doc7.jpeg',
        tags: ['sales', 'data', '2019'],
        language: 'ENGLISH',
        contentLength: 70e3,
        contentTextLength: 25e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: [
          'Total <mark>sales</mark> increased by 5% in Q1.',
          'Highest growth in the <mark>Asia-Pacific</mark> region.'
        ],
        contentTypeIcon: markRaw(PhFileCsv)
      },
      {
        title: 'Supplier Agreement_TechCorp.docx',
        extractionLevel: 2,
        author: 'Procurement Team <procurement@example.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/doc8.jpeg',
        tags: ['supplier', 'agreement', 'contract'],
        language: 'ENGLISH',
        contentLength: 85e3,
        contentTextLength: 60e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: [
          'Terms of <mark>payment</mark> and delivery schedules.',
          'Confidentiality and <mark>non-disclosure</mark> clauses.'
        ],
        contentTypeIcon: markRaw(PhFileDoc)
      },
      {
        title: 'Patent Application_US1234567.pdf',
        extractionLevel: 2,
        author: 'Legal Department <legal@example.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/doc9.jpeg',
        tags: ['patent', 'application', 'legal'],
        language: 'ENGLISH',
        contentLength: 200e3,
        contentTextLength: 150e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: [
          'Description of the <mark>invention</mark> and its applications.',
          'Claims and <mark>drawings</mark> included.'
        ],
        contentTypeIcon: markRaw(PhFilePdf)
      },
      {
        title: 'Workshop Presentation_SlideDeck.pptx',
        extractionLevel: 1,
        author: 'Training Department <training@example.com>',
        project: 'banana-papers',
        creationDate: new Date(),
        inlineFullUrl: 'https://i.imgur.com/ns9ThQx.jpeg',
        path: '/vault/doc10.jpeg',
        tags: ['workshop', 'presentation', 'slides'],
        language: 'ENGLISH',
        contentLength: 110e3,
        contentTextLength: 40e3,
        contentType: 'image/jpeg',
        isSupportedImage: true,
        highlights: [
          'Overview of <mark>training modules</mark>.',
          'Interactive <mark>exercises</mark> and case studies.'
        ],
        contentTypeIcon: markRaw(PhFilePpt)
      }
    ]
  }
}

export const Default = {}
