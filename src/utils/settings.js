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
  documentationUrl: 'https://icij.gitbook.io/datashare',
  documentationLinks: {
    indexing: {
      mac: 'https://icij.gitbook.io/datashare/mac/how-to-add-documents-to-datashare',
      windows: 'https://icij.gitbook.io/datashare/windows/how-to-add-documents-to-datashare',
      linux: 'https://icij.gitbook.io/datashare/linux/how-to-add-documents-to-datashare',
      default: 'https://icij.gitbook.io/datashare/mac/how-to-add-documents-to-datashare'
    },
    operators: {
      default: 'https://icij.gitbook.io/datashare/all/search-with-operators'
    }
  },
  hotKeyPrevented: [
    '.search-bar__input'
  ],
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
    },
    {
      key: 'ja',
      label: '日本語'
    }
  ],
  progressBar: {
    color: '#FA4070'
  },
  searchFields: [
    {
      key: 'all',
      fields: []
    },
    {
      key: 'tags',
      fields: ['tags']
    },
    {
      key: 'title',
      fields: [
        'metadata.tika_metadata_dc_title',
        'metadata.tika_metadata_dc_subject',
        'metadata.tika_metadata_resourcename',
        'path'
      ]
    },
    {
      key: 'author',
      fields: [
        'metadata.tika_metadata_message_from',
        'metadata.tika_metadata_message_from_email',
        'metadata.tika_metadata_message_from_name',
        'metadata.tika_metadata_dc_creator'
      ]
    },
    {
      key: 'recipients',
      fields: ['metadata.tika_metadata_message_to']
    },
    {
      key: 'content',
      fields: ['content']
    },
    {
      key: 'path',
      fields: ['path']
    },
    {
      key: 'thread',
      fields: ['metadata.tika_metadata_message_raw_header_thread_index']
    }
  ],
  searchSortFields: [
    {
      name: 'relevance',
      field: '_score',
      desc: true
    },
    {
      name: 'creationDateNewest',
      field: 'metadata.tika_metadata_dcterms_created',
      desc: true
    },
    {
      name: 'creationDateOldest',
      field: 'metadata.tika_metadata_dcterms_created',
      desc: false
    },
    {
      name: 'dateNewest',
      field: 'extractionDate',
      desc: true
    },
    {
      name: 'dateOldest',
      field: 'extractionDate',
      desc: false
    },
    {
      name: 'sizeLargest',
      field: 'contentLength',
      desc: true
    },
    {
      name: 'sizeSmallest',
      field: 'contentLength',
      desc: false
    },
    {
      name: 'path',
      field: 'path',
      desc: false
    },
    {
      name: 'pathReverse',
      field: 'path',
      desc: true
    }
  ],
  suggestedFields: ['<implicit>', 'tags', 'contentType', 'path', 'mentionNorm'],
  suggestedImplicitFields: ['mentionNorm', 'tags'],
  batchSearch: {
    order: 'desc',
    size: 100,
    sort: 'batch_date',
    status: {
      running: 'RUNNING',
      failure: 'FAILURE',
      queued: 'QUEUED',
      success: 'SUCCESS'
    }
  },
  batchSearchResults: {
    order: 'asc',
    size: 100,
    sort: 'doc_nb'
  },
  userHistory: {
    size: 100
  },
  variantsMap: {
    success: 'success',
    ok: 'success',
    done: 'success',
    danger: 'danger',
    error: 'danger',
    fail: 'danger',
    failed: 'danger',
    failure: 'danger',
    info: 'info',
    pending: 'info',
    queued: 'info',
    running: 'info',
    warning: 'warning',
    cancelled: 'warning'
  },
  elasticsearch: {
    waitForAnswer: 700,
    requestTimeout: 60000
  },
  filter: {
    bucketSize: 25,
    sortBy: '_count',
    sortByOrder: 'desc',
    sortByOptions: [
      { sortBy: '_count', sortByOrder: 'asc' },
      { sortBy: '_count', sortByOrder: 'desc' },
      { sortBy: '_key', sortByOrder: 'asc' },
      { sortBy: '_key', sortByOrder: 'desc' }
    ]
  },
  helpLink: 'https://github.com/ICIJ/datashare/wiki/Datashare-Support',
  faqLink: 'https://icij.gitbook.io/datashare/faq/table-of-contents',
  userGuidesLink: 'https://icij.gitbook.io/datashare/',
  devWikiLink: 'https://github.com/icij/datashare/wiki',
  widgetTextDefaultContent: `Welcome to Datashare Insights!
                             The smartest way to get insights about your documents in minutes.
                             Each widget can be customized with plugins, depending on your project
                             or your documents.`
}
