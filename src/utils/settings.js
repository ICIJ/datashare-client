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
        'metadata.tika_metadata_title',
        'metadata.tika_metadata_subject',
        'path'
      ]
    },
    {
      key: 'author',
      fields: [
        'metadata.tika_metadata_message_from',
        'metadata.tika_metadata_message_from_email',
        'metadata.tika_metadata_message_from_name',
        'metadata.tika_metadata_author',
        'metadata.tika_metadata_meta_author',
        'metadata.tika_metadata_creator',
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
      field: 'metadata.tika_metadata_creation_date',
      desc: true
    },
    {
      name: 'creationDateOldest',
      field: 'metadata.tika_metadata_creation_date',
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
  batchSearchResults: {
    size: 100,
    sort: 'doc_nb',
    order: 'asc'
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
  waitForEsAnswer: 700,
  facetSize: 8
}
