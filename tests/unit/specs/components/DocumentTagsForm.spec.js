import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { App } from '@/main'
import { datashare } from '@/store/modules/document'
import Api from '@/api'
import DocumentTagsForm from '@/components/DocumentTagsForm'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { jsonResp } from 'tests/unit/tests_utils'
import settings from '@/utils/settings'

const { localVue, store } = App.init(createLocalVue()).useAll()

async function createView ({ es, index, tags = [], documentId = 'document', displayTags = true, displayForm = true }) {
  datashare.fetch.mockReturnValue(jsonResp(map(tags, item => { return { label: item, user: { id: 'test-user' } } })))
  await letData(es).have(new IndexedDocument(documentId, index).withTags(tags)).commit()
  await store.dispatch('document/get', { id: documentId, index })
  await store.dispatch('document/getTags')
  return shallowMount(DocumentTagsForm, { localVue, store, propsData: { document: store.state.document.doc, tags: store.state.document.tags, displayTags, displayForm }, mocks: { $t: msg => msg }, sync: false })
}

describe('DocumentTagsForm.vue', () => {
  const index = toLower('DocumentTagsForm')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  const id = 'document'
  let wrapper

  beforeAll(() => store.commit('search/index', index))

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
    datashare.fetch.mockReturnValue(jsonResp())
  })

  afterEach(() => {
    store.commit('document/reset')
    datashare.fetch.mockRestore()
  })

  afterAll(() => removeCookie(process.env.VUE_APP_DS_COOKIE_NAME))

  it('should display form to add new tag', async () => {
    wrapper = await createView({ es, index })

    expect(wrapper.findAll('.document-tags-form__add')).toHaveLength(1)
  })

  it('should NOT display form to add new tag', async () => {
    wrapper = await createView({ es, index, displayForm: false })

    expect(wrapper.findAll('.document-tags-form__add').exists()).toBeFalsy()
  })

  it('should display a text input without autocomplete', async () => {
    wrapper = await createView({ es, index })

    expect(wrapper.findAll('.document-tags-form__add b-form-input-stub')).toHaveLength(1)
    expect(wrapper.find('.document-tags-form__add b-form-input-stub').attributes('autocomplete')).toEqual('off')
  })

  it('should display tags, with delete button', async () => {
    wrapper = await createView({ es, index, tags: ['tag_01', 'tag_02'] })

    expect(wrapper.findAll('.document-tags-form__tags__tag')).toHaveLength(2)
    expect(wrapper.findAll('.document-tags-form__tags__tag__delete')).toHaveLength(2)
  })

  it('should NOT display tags', async () => {
    wrapper = await createView({ es, index, tags: ['tag_01', 'tag_02'], displayTags: false })

    expect(wrapper.find('.document-tags-form__tags__tag').exists()).toBeFalsy()
  })

  it('should display a tooltip to a tag', async () => {
    wrapper = await createView({ es, index, tags: ['tag_01'] })

    expect(wrapper.find('.document-tags-form__tags__tag span').attributes('title')).toContain('document.created_by test-user document.on')
  })

  it('should call API endpoint to add a tag', async () => {
    wrapper = await createView({ es, index, tags: ['tag_01'] })

    datashare.fetch.mockClear()
    wrapper.vm.tag = 'tag_02'
    await wrapper.vm.addTag()

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl(`/api/${index}/documents/batchUpdate/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_02'] }) })
    expect(store.state.document.tags).toHaveLength(2)
    expect(sortBy(store.state.document.tags, ['label'])[0].label).toEqual('tag_01')
    expect(sortBy(store.state.document.tags, ['label'])[1].label).toEqual('tag_02')
  })

  it('should split tags by space', async () => {
    wrapper = await createView({ es, index })

    datashare.fetch.mockClear()
    wrapper.vm.tag = 'tag_01 tag_02 tag_03'
    await wrapper.vm.addTag()

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl(`/api/${index}/documents/batchUpdate/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_01', 'tag_02', 'tag_03'] }) })
  })

  it('should compact tags to remove empty tags', async () => {
    wrapper = await createView({ es, index })

    datashare.fetch.mockClear()
    wrapper.vm.tag = 'tag_01        tag_02'
    await wrapper.vm.addTag()

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl(`/api/${index}/documents/batchUpdate/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_01', 'tag_02'] }) })
  })

  it('should call API endpoint to remove a tag', async () => {
    wrapper = await createView({ es, index, tags: ['tag_01', 'tag_02'] })

    datashare.fetch.mockClear()
    await wrapper.vm.deleteTag({ label: 'tag_01' })

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl(`/api/${index}/documents/batchUpdate/untag`),
      { method: 'POST', body: JSON.stringify({ docIds: [id], tags: ['tag_01'] }) })
  })

  it('should emit a facet::refresh event on adding a tag', async () => {
    wrapper = await createView({ es, index })
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('facet::refresh', mockCallback)

    wrapper.vm.tag = 'tag'
    await wrapper.vm.addTag()
    await delay(settings.waitForEsAnswer)

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should emit a facet::delete event on deleting a tag', async () => {
    wrapper = await createView({ es, index })
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('facet::delete', mockCallback)

    await wrapper.vm.deleteTag('tag')

    expect(mockCallback.mock.calls).toHaveLength(1)
  })
})

function delay (t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}
