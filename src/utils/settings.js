export default {
  contentPlaceholder: {
    rows: [
      {
        height: '1em',
        boxes: [[0, '5em']]
      },
      {
        height: '1em',
        boxes: [[0, '5em'], ['1em', '60%']]
      },
      {
        height: '1em',
        boxes: [[0, '5em']]
      },
      {
        height: '1em',
        boxes: [[0, '5em'], ['1em', '40%']]
      },
      {
        height: '1em',
        boxes: [[0, '5em']]
      }
    ]
  },
  defaultLocale: 'en',
  defaultSearchField: 'all',
  defaultSearchSort: 'relevance',
  documentationLinks: {
    indexing: {
      mac: 'https://icij.gitbook.io/datashare/mac/how-to-add-documents-to-datashare',
      windows: 'https://icij.gitbook.io/datashare/windows/how-to-add-documents-to-datashare',
      linux: 'https://icij.gitbook.io/datashare/linux/how-to-add-documents-to-datashare',
      default: 'https://icij.gitbook.io/datashare/'
    }
  },
  locales: [
    {
      key: 'en',
      label: 'English'
    },
    {
      key: 'fr',
      label: 'Français'
    },
    {
      key: 'es',
      label: 'Español'
    }
  ],
  progressBar: {
    color: '#FA4070'
  },
  searchFields: [
    {
      key: 'all',
      fields: ['*']
    },
    {
      key: 'title',
      fields: []
    },
    {
      key: 'author',
      fields: []
    },
    {
      key: 'recipients',
      fields: []
    },
    {
      key: 'content',
      fields: []
    },
    {
      key: 'path',
      fields: []
    },
    {
      key: 'thread',
      fields: []
    }
  ]
}
