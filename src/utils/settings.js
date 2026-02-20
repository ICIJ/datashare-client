export default {
  cleanableContentTypes: ['application/pdf', 'application/msword'],
  contentPlaceholder: {
    rows: [
      {
        height: '1em',
        boxes: [[0, '5em']]
      },
      {
        height: '1em',
        boxes: [
          [0, '5em'],
          ['1em', '60%']
        ]
      },
      {
        height: '1em',
        boxes: [[0, '5em']]
      },
      {
        height: '1em',
        boxes: [
          [0, '5em'],
          ['1em', '40%']
        ]
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
      mac: 'https://icij.gitbook.io/datashare/local-mode/install-datashare-on-mac/add-documents-to-datashare-on-mac',
      windows:
        'https://icij.gitbook.io/datashare/local-mode/install-datashare-on-windows/add-documents-to-datashare-on-windows',
      linux:
        'https://icij.gitbook.io/datashare/local-mode/install-datashare-on-linux/add-documents-to-datashare-on-linux',
      default: 'https://icij.gitbook.io/datashare/local-mode/install-datashare-on-mac/add-documents-to-datashare-on-mac'
    },
    batchSearch: {
      spreadsheet: 'https://icij.gitbook.io/datashare/usage/batch-search-documents#write-your-queries-in-a-spreadsheet'
    },
    operators: {
      default: 'https://icij.gitbook.io/datashare/usage/search-with-operators'
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
  previewRawMaxContentLength: 5e6,
  iso6392: {
    tesseract: {
      zho: 'chi_sim'
    }
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
  searchSortFieldParams: {
    'metadata.tika_metadata_dcterms_created': { unmapped_type: 'date' }
  },
  legacySearchSortFields: [
    { name: 'relevance', property: '_score', desc: true },
    { name: 'creationDateNewest', property: 'creationDate', desc: true },
    { name: 'creationDateOldest', property: 'creationDate', desc: false },
    { name: 'dateNewest', property: 'extractionDate', desc: true },
    { name: 'dateOldest', property: 'extractionDate', desc: false },
    { name: 'sizeLargest', property: 'contentLength', desc: true },
    { name: 'sizeSmallest', property: 'contentLength', desc: false },
    { name: 'path', property: 'path', desc: false },
    { name: 'pathReverse', property: 'path', desc: true },
    { name: 'titleNorm', property: 'title', desc: false },
    { name: 'titleNormReverse', property: 'title', desc: true }
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
    draft: 'warning',
    running: 'info',
    warning: 'warning',
    cancelled: 'warning',
    created: 'info',
    in_progress: 'info',
    partial: 'warning'
  },
  csrf: {
    cookieName: '_ds_csrf_token',
    headerName: 'X-DS-CSRF-TOKEN'
  },
  elasticsearch: {
    waitForAnswer: 700,
    requestTimeout: 60000
  },
  filter: {
    bucketSize: 25,
    sortBy: '_count',
    orderBy: 'desc',
    sortByOptions: [
      { sortBy: '_count', orderBy: 'asc' },
      { sortBy: '_count', orderBy: 'desc' },
      { sortBy: '_key', orderBy: 'asc' },
      { sortBy: '_key', orderBy: 'desc' }
    ]
  },
  helpLink: 'https://icij.gitbook.io/datashare/ask-for-help',
  faqLink: 'https://icij.gitbook.io/datashare/usage/faq',
  documentationLink: 'https://icij.gitbook.io/datashare/',
  widgetTextDefaultContent: `Welcome to Datashare Insights!
                             The smartest way to get insights about your documents in minutes.
                             Each widget can be customized with plugins, depending on your project
                             or your documents.`
}
