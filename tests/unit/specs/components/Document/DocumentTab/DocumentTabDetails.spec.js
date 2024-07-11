import { mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import DocumentTabDetails from '@/components/Document/DocumentTab/DocumentTabDetails'

describe('DocumentTabDetails.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const id = 'document'
  let wrapper, core

  beforeAll(() => {
    const api = { elasticsearch: es }
    core = CoreSetup.init(api).useAll()
  })

  afterEach(() => {
    core.store.commit('document/reset')
    core.config.merge({ dataDir: null, mountedDataDir: null })
  })

  it('should display document path with config.mountedDataDir', async () => {
    core.config.merge({ dataDir: '/home/datashare/data', mountedDataDir: 'C:/Users/ds/docs' })
    const id = '/home/datashare/data/foo.txt'
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await core.store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins
      },
      props: {
        document: core.store.state.document.doc
      }
    })

    const input = wrapper.find('.document__content__path input[type=text]')
    expect(input.element.value).toBe('C:/Users/ds/docs/foo.txt')
  })

  it('should display the document type', async () => {
    await letData(es).have(new IndexedDocument(id, index).withContentType('application/pdf')).commit()
    await core.store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins
      },
      props: {
        document: core.store.state.document.doc
      }
    })

    const input = wrapper.find('.document__content__content-type input[type=text]')
    expect(input.element.value).toBe('Portable Document Format (PDF)')
  })

  it('should display a child document', async () => {
    const parentDocument = 'parentDocument'
    await letData(es).have(new IndexedDocument(parentDocument, index).withResourceName('parentDocument')).commit()
    await letData(es).have(new IndexedDocument(id, index).withParent(parentDocument)).commit()
    await core.store
      .dispatch('document/get', { index, id, routing: parentDocument })
      .then(() => core.store.dispatch('document/getParent'))
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins
      },
      props: {
        document: core.store.state.document.doc,
        parentDocument: core.store.state.document.parentDocument
      }
    })

    const inputBasename = wrapper.find('.document__content__basename input[type=text]')
    expect(inputBasename.element.value).toBe(id)

    const inputTreeLevel = wrapper.find('.document__content__tree-level input[type=text]')
    expect(inputTreeLevel.element.value).toBe('1st')

    const inputParent = wrapper.find('.document__content__parent input[type=text]')
    expect(inputParent.element.value).toBe(parentDocument)
  })

  it('should not display the creation date if it is missing', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await core.store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins
      },
      props: {
        document: core.store.state.document.doc
      }
    })

    expect(wrapper.find('.document__content__creation-date').exists()).toBeFalsy()
  })

  it('should display the creation date if it is defined', async () => {
    await letData(es).have(new IndexedDocument(id, index).withCreationDate('2020-12-04T00:00:01Z')).commit()
    await core.store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins
      },
      props: {
        document: core.store.state.document.doc
      }
    })

    expect(wrapper.find('.document__content__creation-date').exists()).toBeTruthy()
  })

  it('should not display the author if it is missing', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await core.store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins
      },
      props: {
        document: core.store.state.document.doc
      }
    })

    expect(wrapper.find('.document__content__author').exists()).toBeFalsy()
  })

  it('should display the author date if it is defined', async () => {
    await letData(es).have(new IndexedDocument(id, index).withAuthor('local')).commit()
    await core.store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins
      },
      props: {
        document: core.store.state.document.doc
      }
    })

    expect(wrapper.find('.document__content__author').exists()).toBeTruthy()
  })

  it('should display a link to the list of children documents', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await core.store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins
      },
      props: {
        document: core.store.state.document.doc
      }
    })

    expect(wrapper.find('.document__content__shortcuts__children').exists()).toBeTruthy()
  })

  it('should display a link to the search in the folder of the document', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await core.store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins
      },
      props: {
        document: core.store.state.document.doc
      }
    })

    expect(wrapper.find('.document__content__shortcuts__folder').exists()).toBeTruthy()
  })

  it('should display an "Unknown" file size', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await core.store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins
      },
      props: {
        document: core.store.state.document.doc
      }
    })

    expect(wrapper.find('.document__content__content-length').exists()).toBeTruthy()
    expect(wrapper.find('.document__content__content-length td:last-of-type').text().trim()).toBe('Unknown')
  })

  it('should display an file size', async () => {
    await letData(es).have(new IndexedDocument(id, index).withContentLength('123456')).commit()
    await core.store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: {
        document: core.store.state.document.doc
      }
    })

    const input = wrapper.find('.document__content__content-length input[type=text]')
    expect(input.exists()).toBeTruthy()
    expect(input.element.value).toBe('120.56 KB (123456 B)')
  })

  it('should display the title and the normalized title', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await core.store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      global: {
        plugins: core.plugins
      },
      props: {
        document: core.store.state.document.doc
      }
    })

    expect(wrapper.find('.document__content__title').exists()).toBeTruthy()
  })
})
