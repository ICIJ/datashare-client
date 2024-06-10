import { map, sortBy } from 'lodash'
import { removeCookie, setCookie } from 'tiny-cookie'
import { shallowMount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { flushPromises } from '~tests/unit/tests_utils'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import DocumentTagsForm from '@/components/DocumentTagsForm'
import settings from '@/utils/settings'

describe('DocumentTagsForm.vue', () => {
  let wrapper, core, api
  const { index: project, es } = esConnectionHelper.build()
  const id = 'document'

  function delay(t, v) {
    return new Promise(function (resolve) {
      setTimeout(resolve.bind(null, v), t)
    })
  }

  async function createView({
    es,
    project,
    tags = [],
    documentId = 'document',
    displayTags = true,
    displayForm = true
  }) {
    api.getTags.mockResolvedValue(map(tags, (item) => ({ label: item, user: { id: 'test-user' } })))
    await letData(es).have(new IndexedDocument(documentId, project).withTags(tags)).commit()
    await core.store.dispatch('document/get', { id: documentId, index: project })
    await core.store.dispatch('document/getTags')

    const wrapper = shallowMount(DocumentTagsForm, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: {
        document: core.store.state.document.doc,
        tags: core.store.state.document.tags,
        displayTags,
        displayForm
      }
    })
    await flushPromises()
    return wrapper
  }

  beforeAll(() => {
    api = {
      getTags: vi.fn(),
      tagDocuments: vi.fn(),
      untagDocuments: vi.fn(),
      elasticsearch: es
    }

    core = CoreSetup.init(api).useAll()
    core.store.commit('search/index', project)
  })

  beforeEach(() => {
    vi.clearAllMocks()
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  afterEach(() => core.store.commit('document/reset'))

  afterAll(() => {
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
  })

  it('should NOT display form to add new tag', async () => {
    wrapper = await createView({ es, project, displayForm: false })

    expect(wrapper.find('.document-tags-form__add').exists()).toBeFalsy()
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
    core.config.set('userAdmin', 'icij')
    wrapper = await createView({ es, project })
    wrapper.vm.tags.push({ label: 'tag_01', user: { id: 'test-user' } }, { label: 'tag_02', user: { id: 'icij' } })
    await flushPromises()

    expect(wrapper.findAll('.document-tags-form__tags__tag')).toHaveLength(2)
    expect(wrapper.findAll('.document-tags-form__tags__tag__delete')).toHaveLength(1)
  })

  it('should display tags normally if no admin user defined', async () => {
    core.config.set('userAdmin', undefined)
    wrapper = await createView({ es, project })
    wrapper.vm.tags.push({ label: 'tag_01', user: { id: 'test-user' } }, { label: 'tag_02', user: { id: 'admin' } })
    await flushPromises()

    expect(wrapper.findAll('.document-tags-form__tags__tag')).toHaveLength(2)
    expect(wrapper.findAll('.document-tags-form__tags__tag__delete')).toHaveLength(2)
  })

  it('should NOT display tags', async () => {
    wrapper = await createView({ es, project, tags: ['tag_01', 'tag_02'], displayTags: false })

    expect(wrapper.find('.document-tags-form__tags__tag').exists()).toBeFalsy()
  })

  it('should display a tooltip to a tag', async () => {
    wrapper = await createView({ es, project, tags: ['tag_01'] })
    const title = wrapper.find('.document-tags-form__tags__tag span').attributes('data-original-title')
    expect(title).toContain('Created by test-user on ')
  })

  it('should call API endpoint to add a tag', async () => {
    wrapper = await createView({ es, project, tags: ['tag_01'] })

    wrapper.vm.tag = 'tag_02'
    await wrapper.vm.addTag()

    expect(api.tagDocuments).toBeCalledTimes(1)
    expect(api.tagDocuments).toBeCalledWith(project, [id], ['tag_02'])

    expect(core.store.state.document.tags).toHaveLength(2)
    expect(sortBy(core.store.state.document.tags, ['label'])[0].label).toEqual('tag_01')
    expect(sortBy(core.store.state.document.tags, ['label'])[1].label).toEqual('tag_02')
  })

  it('should split tags by space', async () => {
    wrapper = await createView({ es, project })

    wrapper.vm.tag = 'tag_01 tag_02 tag_03'
    await wrapper.vm.addTag()

    expect(api.tagDocuments).toBeCalledTimes(1)
    expect(api.tagDocuments).toBeCalledWith(project, [id], ['tag_01', 'tag_02', 'tag_03'])
  })

  it('should compact tags to remove empty tags', async () => {
    wrapper = await createView({ es, project })

    wrapper.vm.tag = 'tag_01        tag_02'
    await wrapper.vm.addTag()

    expect(api.tagDocuments).toBeCalledTimes(1)
    expect(api.tagDocuments).toBeCalledWith(project, [id], ['tag_01', 'tag_02'])
  })

  it('should call API endpoint to remove a tag', async () => {
    wrapper = await createView({ es, project, tags: ['tag_01', 'tag_02'] })

    await wrapper.vm.deleteTag({ label: 'tag_01' })

    expect(api.untagDocuments).toBeCalledTimes(1)
    expect(api.untagDocuments).toBeCalledWith(project, [id], ['tag_01'])
  })

  it('should emit a filter::refresh event on adding a tag', async () => {
    wrapper = await createView({ es, project })
    const mockCallback = vi.fn()
    core.on('filter::refresh', mockCallback)

    wrapper.vm.tag = 'tag'
    await wrapper.vm.addTag()
    await delay(settings.elasticsearch.waitForAnswer)

    expect(mockCallback).toHaveBeenCalled()
  })

  it('should emit a filter::delete event on deleting a tag', async () => {
    wrapper = await createView({ es, project })
    const mockCallback = vi.fn()
    core.on('filter::delete', mockCallback)

    await wrapper.vm.deleteTag('tag')
    expect(mockCallback).toHaveBeenCalled()
  })

  it('should search for tag suggestions', async () => {
    wrapper = await createView({ es, project, tags: ['tag_01', 'tag_02'] })

    await wrapper.vm.searchTags('tag')
    expect(wrapper.vm.suggestions).toEqual(['tag_01', 'tag_02'])
  })
})
