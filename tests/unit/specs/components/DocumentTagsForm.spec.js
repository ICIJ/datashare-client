import VueI18n from 'vue-i18n'
import { createServer } from 'http-server'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import DocumentTagsForm from '@/components/DocumentTagsForm'
import messages from '@/lang/en'
import store from '@/store'
import '@/utils/font-awesome'
import { datashare } from '@/store/modules/document'
import { jsonOk } from 'tests/unit/tests_utils'
import DatashareClient from '@/api/DatashareClient'
import esClient from '@/api/esClient'
import settings from '@/utils/settings'
import BootstrapVue from 'bootstrap-vue'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

async function createView (es, tags = [], documentId = 'document') {
  await letData(es).have(new IndexedDocument(documentId).withTags(tags)).commit()
  await store.dispatch('document/get', { id: documentId })
  return shallowMount(DocumentTagsForm, { localVue, i18n, store, propsData: { document: store.state.document.doc, displayTags: true } })
}

describe('DocumentTagsForm', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let httpServer, spy
  const id = 'document'

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    spy = jest.spyOn(esClient, 'getEsDoc')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  afterEach(() => {
    store.commit('document/reset')
    datashare.fetch.mockRestore()
  })

  afterAll(() => httpServer.close())

  it('should display form to add new tag', async () => {
    const wrapper = await createView(es)

    expect(wrapper.findAll('.document-tags-form__add')).toHaveLength(1)
  })

  it('should display a text input without autocomplete', async () => {
    const wrapper = await createView(es)

    expect(wrapper.findAll('.document-tags-form__add b-form-input-stub')).toHaveLength(1)
    expect(wrapper.find('.document-tags-form__add b-form-input-stub').attributes('autocomplete')).toEqual('off')
  })

  it('should display tags, with delete button', async () => {
    const wrapper = await createView(es, ['tag_01', 'tag_02'])

    expect(wrapper.findAll('.document-tags-form__tag')).toHaveLength(2)
    expect(wrapper.findAll('.document-tags-form__tag__delete')).toHaveLength(2)
  })

  it('should call API endpoint to add a tag and then reload the document from ES', async () => {
    const wrapper = await createView(es, ['tag_01'])

    spy.mockClear()
    wrapper.vm.tag = 'tag_02'
    await wrapper.vm.addTag()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_02'] }) })
    expect(esClient.getEsDoc).toHaveBeenCalledTimes(1)
  })

  it('should split tags by space', async () => {
    const wrapper = await createView(es)

    spy.mockClear()
    wrapper.vm.tag = 'tag_01 tag_02 tag_03'
    await wrapper.vm.addTag()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_01', 'tag_02', 'tag_03'] }) })
  })

  it('should compact tags to remove empty tags', async () => {
    const wrapper = await createView(es)

    spy.mockClear()
    wrapper.vm.tag = 'tag_01        tag_02'
    await wrapper.vm.addTag()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_01', 'tag_02'] }) })
    expect(esClient.getEsDoc).toHaveBeenCalledTimes(1)
  })

  it('should call API endpoint to remove a tag and then reload the document from ES', async () => {
    const wrapper = await createView(es, ['tag_01', 'tag_02'])

    spy.mockClear()
    await wrapper.vm.deleteTag('tag_01')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/untag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_01'] }) })
    expect(esClient.getEsDoc).toHaveBeenCalledTimes(1)
  })

  it('should emit a facet::refresh event on adding a tag', async () => {
    const wrapper = await createView(es)
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('facet::refresh', mockCallback)

    wrapper.vm.tag = 'tag'
    await wrapper.vm.addTag()
    await delay(settings.waitForEsAnswer)

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should emit a facet::refresh event on deleting a tag', async () => {
    const wrapper = await createView(es)
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('facet::refresh', mockCallback)

    await wrapper.vm.deleteTag('tag')
    await delay(settings.waitForEsAnswer)

    expect(mockCallback.mock.calls).toHaveLength(1)
  })
})

function delay (t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}
