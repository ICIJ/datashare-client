import axios from 'axios'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import Api from '@/api'
import { Core } from '@/core'
import DocumentTagsForm from '@/components/DocumentTagsForm'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import Murmur from '@icij/murmur'
import settings from '@/utils/settings'

jest.mock('axios')

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()

async function createView ({ es, project, tags = [], documentId = 'document', displayTags = true, displayForm = true }) {
  axios.request.mockResolvedValue({ data: map(tags, item => { return { label: item, user: { id: 'test-user' } } }) })
  await letData(es).have(new IndexedDocument(documentId, project).withTags(tags)).commit()
  await store.dispatch('document/get', { id: documentId, index: project })
  await store.dispatch('document/getTags')
  return shallowMount(DocumentTagsForm, { i18n, localVue, store, propsData: { document: store.state.document.doc, tags: store.state.document.tags, displayTags, displayForm }, sync: false })
}

describe('DocumentTagsForm.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  const id = 'document'
  let wrapper

  beforeAll(() => store.commit('search/index', project))

  beforeEach(() => setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify))

  afterEach(() => store.commit('document/reset'))

  afterAll(() => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    jest.unmock('axios')
  })

  it('should display form to add new tag', async () => {
    wrapper = await createView({ es, project })

    expect(wrapper.findAll('.document-tags-form__add')).toHaveLength(1)
  })

  it('should NOT display form to add new tag', async () => {
    wrapper = await createView({ es, project, displayForm: false })

    expect(wrapper.findAll('.document-tags-form__add').exists()).toBeFalsy()
  })

  it('should display a text input without autocomplete', async () => {
    wrapper = await createView({ es, project })

    expect(wrapper.findAll('.document-tags-form__add b-form-input-stub')).toHaveLength(1)
    expect(wrapper.find('.document-tags-form__add b-form-input-stub').attributes('autocomplete')).toEqual('off')
  })

  it('should display tags, with delete button', async () => {
    wrapper = await createView({ es, project, tags: ['tag_01', 'tag_02'] })

    expect(wrapper.findAll('.document-tags-form__tags__tag')).toHaveLength(2)
    expect(wrapper.findAll('.document-tags-form__tags__tag__delete')).toHaveLength(2)
  })

  it('should display tags, but not delete button if tag was created by the admin user', async () => {
    Murmur.config.set('userAdmin', 'icij')
    wrapper = await createView({ es, project })
    await wrapper.vm.tags.push({ label: 'tag_01', user: { id: 'test-user' } }, { label: 'tag_02', user: { id: 'icij' } })

    expect(wrapper.findAll('.document-tags-form__tags__tag')).toHaveLength(2)
    expect(wrapper.findAll('.document-tags-form__tags__tag__delete')).toHaveLength(1)
  })

  it('should display tags normally if no admin user defined', async () => {
    Murmur.config.set('userAdmin', undefined)
    wrapper = await createView({ es, project })
    await wrapper.vm.tags.push({ label: 'tag_01', user: { id: 'test-user' } }, { label: 'tag_02', user: { id: 'admin' } })

    expect(wrapper.findAll('.document-tags-form__tags__tag')).toHaveLength(2)
    expect(wrapper.findAll('.document-tags-form__tags__tag__delete')).toHaveLength(2)
  })

  it('should NOT display tags', async () => {
    wrapper = await createView({ es, project, tags: ['tag_01', 'tag_02'], displayTags: false })

    expect(wrapper.find('.document-tags-form__tags__tag').exists()).toBeFalsy()
  })

  it('should display a tooltip to a tag', async () => {
    wrapper = await createView({ es, project, tags: ['tag_01'] })

    expect(wrapper.find('.document-tags-form__tags__tag span').attributes('title')).toContain('Created by test-user on ')
  })

  it('should call API endpoint to add a tag', async () => {
    wrapper = await createView({ es, project, tags: ['tag_01'] })

    axios.request.mockClear()
    wrapper.vm.tag = 'tag_02'
    await wrapper.vm.addTag()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/${project}/documents/batchUpdate/tag`),
      method: 'POST',
      data: {
        docIds: [id],
        tags: ['tag_02']
      }
    }))
    expect(store.state.document.tags).toHaveLength(2)
    expect(sortBy(store.state.document.tags, ['label'])[0].label).toEqual('tag_01')
    expect(sortBy(store.state.document.tags, ['label'])[1].label).toEqual('tag_02')
  })

  it('should split tags by space', async () => {
    wrapper = await createView({ es, project })

    axios.request.mockClear()
    wrapper.vm.tag = 'tag_01 tag_02 tag_03'
    await wrapper.vm.addTag()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/${project}/documents/batchUpdate/tag`),
      method: 'POST',
      data: {
        docIds: [id],
        tags: ['tag_01', 'tag_02', 'tag_03']
      }
    }))
  })

  it('should compact tags to remove empty tags', async () => {
    wrapper = await createView({ es, project })

    axios.request.mockClear()
    wrapper.vm.tag = 'tag_01        tag_02'
    await wrapper.vm.addTag()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/${project}/documents/batchUpdate/tag`),
      method: 'POST',
      data: {
        docIds: [id],
        tags: ['tag_01', 'tag_02']
      }
    }))
  })

  it('should call API endpoint to remove a tag', async () => {
    wrapper = await createView({ es, project, tags: ['tag_01', 'tag_02'] })

    axios.request.mockClear()
    await wrapper.vm.deleteTag({ label: 'tag_01' })

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/${project}/documents/batchUpdate/untag`),
      method: 'POST',
      data: {
        docIds: [id],
        tags: ['tag_01']
      }
    }))
  })

  it('should emit a filter::refresh event on adding a tag', async () => {
    wrapper = await createView({ es, project })
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('filter::refresh', mockCallback)

    wrapper.vm.tag = 'tag'
    await wrapper.vm.addTag()
    await delay(settings.elasticsearch.waitForAnswer)

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should emit a filter::delete event on deleting a tag', async () => {
    wrapper = await createView({ es, project })
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('filter::delete', mockCallback)

    await wrapper.vm.deleteTag('tag')

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should search for tag suggestions', async () => {
    wrapper = await createView({ es, project, tags: ['tag_01', 'tag_02'] })

    await wrapper.vm.searchTags('tag')
    expect(wrapper.vm.suggestions).toEqual(['tag_01', 'tag_02'])
  })
})

function delay (t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}
