import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import DocumentTagsForm from '@/components/DocumentTagsForm'
import store from '@/store'
import '@/utils/font-awesome'
import { datashare } from '@/store/modules/document'
import { jsonOk } from 'tests/unit/tests_utils'
import DatashareClient from '@/api/DatashareClient'
import settings from '@/utils/settings'
import BootstrapVue from 'bootstrap-vue'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(BootstrapVue)

async function createView (es, tags = [], documentId = 'document') {
  datashare.fetch.mockReturnValue(jsonOk(map(tags, item => { return { label: item, user: { id: 'test-user' } } })))
  await letData(es).have(new IndexedDocument(documentId).withTags(tags)).commit()
  await store.dispatch('document/get', { id: documentId })
  await store.dispatch('document/getTags')
  return shallowMount(DocumentTagsForm, { localVue, store, propsData: { document: store.state.document.doc, tags: store.state.document.tags, displayTags: true }, mocks: { $t: msg => msg } })
}

describe('DocumentTagsForm', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  const id = 'document'

  beforeAll(() => {
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  afterEach(() => {
    store.commit('document/reset')
    datashare.fetch.mockRestore()
  })

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

    expect(wrapper.findAll('.document-tags-form__tags__tag')).toHaveLength(2)
    expect(wrapper.findAll('.document-tags-form__tags__tag__delete')).toHaveLength(2)
  })

  it('should display a tooltip to a tag', async () => {
    const wrapper = await createView(es, ['tag_01'])

    expect(wrapper.find('.document-tags-form__tags__tag span').attributes('data-original-title')).toContain('document.created_by test-user document.on')
  })

  it('should call API endpoint to add a tag', async () => {
    const wrapper = await createView(es, ['tag_01'])

    datashare.fetch.mockClear()
    wrapper.vm.tag = 'tag_02'
    await wrapper.vm.addTag()

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_02'] }) })
    expect(store.state.document.tags).toHaveLength(2)
    expect(sortBy(store.state.document.tags, ['label'])[0].label).toEqual('tag_01')
    expect(sortBy(store.state.document.tags, ['label'])[1].label).toEqual('tag_02')
  })

  it('should split tags by space', async () => {
    const wrapper = await createView(es)

    datashare.fetch.mockClear()
    wrapper.vm.tag = 'tag_01 tag_02 tag_03'
    await wrapper.vm.addTag()

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_01', 'tag_02', 'tag_03'] }) })
  })

  it('should compact tags to remove empty tags', async () => {
    const wrapper = await createView(es)

    datashare.fetch.mockClear()
    wrapper.vm.tag = 'tag_01        tag_02'
    await wrapper.vm.addTag()

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_01', 'tag_02'] }) })
  })

  it('should call API endpoint to remove a tag and then call another endpoint to reload the tags', async () => {
    const wrapper = await createView(es, ['tag_01', 'tag_02'])

    datashare.fetch.mockClear()
    await wrapper.vm.deleteTag({ label: 'tag_01' })

    expect(datashare.fetch).toBeCalledTimes(2)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/untag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_01'] }) })
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
