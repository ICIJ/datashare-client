import Murmur from '@icij/murmur'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import BatchSearchForm from '@/components/BatchSearchForm'
import { Core } from '@/core'

jest.mock('lodash/throttle', () => jest.fn((fn) => fn))

describe('BatchSearchForm.vue', () => {
  const { i18n, localVue, wait } = Core.init(createLocalVue()).useAll()
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()

  const state = { batchSearches: [] }
  const actions = { onSubmit: jest.fn(), getBatchSearches: jest.fn() }
  const store = new Vuex.Store({
    modules: {
      batchSearch: { namespaced: true, state, actions },
      search: { namespaced: true, actions: { queryFilter: jest.fn() } }
    }
  })
  let wrapper = null

  beforeAll(() => Murmur.config.merge({ groups_by_applications: { datashare: [project] }, dataDir: '/root/project' }))

  beforeEach(() => {
    Murmur.config.merge({ mode: 'LOCAL' })
    wrapper = shallowMount(BatchSearchForm, { i18n, localVue, store, wait })
  })
  afterEach(() => {
    actions.onSubmit.mockReset()
  })

  afterAll(() => jest.unmock('lodash/throttle'))

  it('should call the store action on form submit and reset the form', async () => {
    jest.spyOn(wrapper.vm, 'resetForm')

    await wrapper.vm.onSubmit()

    expect(actions.onSubmit).toBeCalled()
    expect(wrapper.vm.resetForm).toBeCalled()
  })
  describe('on LOCAL', () => {
    it('should display a form with 8 fields: name, csvFile, description, phraseMatch, fuzziness, fileTypes, tags and paths on LOCAL', () => {
      expect(wrapper.find('.batch-search-form__name').exists()).toBe(true)
      expect(wrapper.find('.batch-search-form__fileLabel').exists()).toBe(true)
      expect(wrapper.find('.batch-search-form__description').exists()).toBe(true)
      expect(wrapper.find('.batch-search-form__phraseMatch').exists()).toBe(true)
      expect(wrapper.find('.batch-search-form__fuzziness').exists()).toBe(true)
      expect(wrapper.find('.batch-search-form__fileTypes').exists()).toBe(true)
      expect(wrapper.find('.batch-search-form__tags').exists()).toBe(true)
      expect(wrapper.find('.batch-search-form__path').exists()).toBe(true)
    })
    it('should not display "Published" button', () => {
      expect(wrapper.find('.batch-search-form__published').exists()).toBe(false)
    })
    it('should not display a project selector', () => {
      expect(wrapper.find('.batch-search-form__projects').exists()).toBe(false)
    })
  })

  describe('on SERVER', () => {
    beforeEach(() => {
      Murmur.config.merge({ mode: 'SERVER' })
      wrapper = shallowMount(BatchSearchForm, { i18n, localVue, store, wait })
    })

    it('should display "Published" button', () => {
      expect(wrapper.find('.batch-search-form__published').exists()).toBe(true)
    })
    it('should display a project selector', () => {
      expect(wrapper.find('.batch-search-form__projects').exists()).toBe(true)
    })

    describe('On project change', () => {
      it('should reset fileType, tags and path', async () => {
        await wrapper.setData({ fileType: 'fileTypeTest', tag: 'tagTest' })
        await wrapper.setData({ projects: [anotherProject] })

        expect(wrapper.vm.fileType).toBe('')
        expect(wrapper.vm.tag).toBe('')
      })

      it('should reset fileTypes and paths', async () => {
        await wrapper.setData({ fileTypes: ['fileType_01', 'fileType_02'] })
        await wrapper.setData({ tags: ['tag_01', 'tag_02'] })
        await wrapper.setData({ paths: ['path_01', 'path_02'] })
        await wrapper.setData({ projects: [anotherProject] })

        expect(wrapper.vm.fileTypes).toEqual([])
        expect(wrapper.vm.tags).toEqual([])
        expect(wrapper.vm.paths).toEqual([])
      })

      it('should reset allFileTypes', async () => {
        await wrapper.setData({ allFileTypes: ['fileType_01', 'fileType_02'] })
        await wrapper.setData({ projects: [anotherProject] })

        expect(wrapper.vm.allFileTypes).toEqual([])
      })

      it('should reset allTags', async () => {
        await wrapper.setData({ allTags: ['tag_01', 'tag_02'] })
        await wrapper.setData({ projects: [anotherProject] })

        expect(wrapper.vm.allTags).toEqual([])
      })

      it('should call hideSuggestionsFileTypes, hideSuggestionsTags and hideSuggestionsPaths', async () => {
        jest.spyOn(wrapper.vm, 'hideSuggestionsFileTypes')
        jest.spyOn(wrapper.vm, 'hideSuggestionsTags')
        await wrapper.setData({ projects: [anotherProject] })

        expect(wrapper.vm.hideSuggestionsFileTypes).toBeCalled()
        expect(wrapper.vm.hideSuggestionsTags).toBeCalled()
      })

      it('should call retrieveFileTypes', async () => {
        jest.spyOn(wrapper.vm, 'retrieveFileTypes')
        await wrapper.setData({ projects: [anotherProject] })

        expect(wrapper.vm.retrieveFileTypes).toBeCalled()
      })

      it('should call retrieveTags', async () => {
        jest.spyOn(wrapper.vm, 'retrieveTags')
        await wrapper.setData({ projects: [anotherProject] })

        expect(wrapper.vm.retrieveTags).toBeCalled()
      })
    })
  })

  it('should reset the form', () => {
    wrapper.vm.$set(wrapper.vm, 'csvFile', new File(['File content'], 'test_file.csv', { type: 'text/csv' }))
    wrapper.vm.$set(wrapper.vm, 'description', 'This is a description')
    wrapper.vm.$set(wrapper.vm, 'fileType', 'PDF')
    wrapper.vm.$set(wrapper.vm, 'fileTypes', [{ label: 'PDF' }])
    wrapper.vm.$set(wrapper.vm, 'tag', 'tagTest')
    wrapper.vm.$set(wrapper.vm, 'tags', [{ tag: 'tagTest' }])
    wrapper.vm.$set(wrapper.vm, 'fuzziness', 2)
    wrapper.vm.$set(wrapper.vm, 'name', 'Example')
    wrapper.vm.$set(wrapper.vm, 'paths', ['This', 'is', 'a', 'multiple', 'paths'])
    wrapper.vm.$set(wrapper.vm, 'phraseMatch', false)
    wrapper.vm.$set(wrapper.vm, 'projects', ['project-example'])
    wrapper.vm.$set(wrapper.vm, 'published', false)
    wrapper.vm.$set(wrapper.vm, 'showAdvancedFilters', true)

    wrapper.vm.resetForm()

    expect(wrapper.vm.csvFile).toBeNull()
    expect(wrapper.vm.description).toBe('')
    expect(wrapper.vm.fileType).toBe('')
    expect(wrapper.vm.fileTypes).toEqual([])
    expect(wrapper.vm.tag).toBe('')
    expect(wrapper.vm.tags).toEqual([])
    expect(wrapper.vm.fuzziness).toBe(0)
    expect(wrapper.vm.name).toBe('')
    expect(wrapper.vm.paths).toEqual([])
    expect(wrapper.vm.phraseMatch).toBe(true)
    expect(wrapper.vm.projects).toContainEqual(project)
    expect(wrapper.vm.published).toBe(true)
    expect(wrapper.vm.showAdvancedFilters).toBe(false)
  })

  it('should reset the fuzziness to 0 on phraseMatch change', async () => {
    await wrapper.setData({ fuzziness: 12 })
    await wrapper.setData({ phraseMatch: false })

    expect(wrapper.vm.fuzziness).toBe(0)
  })

  describe('FileTypes suggestions', () => {
    it('should display suggestions', () => {
      expect(wrapper.find('.batch-search-form__fileTypes__suggestions').exists()).toBe(true)
    })

    it('should hide suggestions', () => {
      wrapper.vm.$set(wrapper.vm, 'suggestionFileTypes', ['suggestion_01', 'suggestion_02', 'suggestion_03'])

      wrapper.vm.hideSuggestionsFileTypes()

      expect(wrapper.vm.suggestionFileTypes).toEqual([])
    })

    it('should filter fileTypes according to the fileTypes input on mime file', () => {
      wrapper.vm.$set(wrapper.vm, 'allFileTypes', [
        { label: 'Visio document', mime: 'visio' },
        { label: 'StarWriter 5 document', mime: 'vision' },
        { label: 'Something else', mime: 'else' }
      ])
      wrapper.vm.$set(wrapper.vm, 'fileType', 'visi')

      wrapper.vm.searchFileTypes()

      expect(wrapper.vm.suggestionFileTypes).toHaveLength(2)
      expect(wrapper.vm.suggestionFileTypes[0].label).toBe('Visio document')
      expect(wrapper.vm.suggestionFileTypes[1].label).toBe('StarWriter 5 document')
    })

    it('should filter according to the fileTypes input on label file', () => {
      wrapper.vm.$set(wrapper.vm, 'allFileTypes', [
        { label: 'Label PDF', mime: 'PDF' },
        { label: 'another type', mime: 'other' }
      ])
      wrapper.vm.$set(wrapper.vm, 'fileType', 'PDF')

      wrapper.vm.searchFileTypes()

      expect(wrapper.vm.suggestionFileTypes).toHaveLength(1)
      expect(wrapper.vm.suggestionFileTypes[0].label).toBe('Label PDF')
    })

    it('should hide already selected file type from suggestions', () => {
      wrapper.vm.$set(wrapper.vm, 'fileTypes', [{ mime: 'application/pdf', label: 'Portable Document Format (PDF)' }])
      wrapper.vm.$set(wrapper.vm, 'fileType', 'PDF')

      wrapper.vm.searchFileTypes()

      expect(wrapper.vm.suggestionFileTypes).toHaveLength(0)
    })

    it('should set the clicked item in fileTypes', () => {
      wrapper = mount(BatchSearchForm, { i18n, localVue, store, wait })
      wrapper.vm.$set(wrapper.vm, 'fileTypes', [{ label: 'Excel 2003 XML spreadsheet visio' }])
      wrapper.vm.$set(wrapper.vm, 'selectedFileType', { label: 'StarWriter 5 document' })
      wrapper.vm.searchFileType()

      expect(wrapper.vm.fileTypes).toEqual([
        { label: 'Excel 2003 XML spreadsheet visio' },
        { label: 'StarWriter 5 document' }
      ])
    })
  })

  describe('Tags suggestions', () => {
    it('should display suggestions', () => {
      expect(wrapper.find('.batch-search-form__tags__suggestions').exists()).toBe(true)
    })

    it('should hide suggestions', () => {
      wrapper.vm.$set(wrapper.vm, 'suggestionTags', ['suggestion_01', 'suggestion_02', 'suggestion_03'])

      wrapper.vm.hideSuggestionsTags()

      expect(wrapper.vm.suggestionTags).toEqual([])
    })

    it('should filter tags according to the tag input', () => {
      wrapper.vm.$set(wrapper.vm, 'allTags', [
        { tag: 'tag_number_01' },
        { tag: 'tag_number_02' },
        { tag: 'random_tag' }
      ])
      wrapper.vm.$set(wrapper.vm, 'tag', 'number')

      wrapper.vm.searchTags()

      expect(wrapper.vm.suggestionTags).toHaveLength(2)
      expect(wrapper.vm.suggestionTags[0].tag).toBe('tag_number_01')
      expect(wrapper.vm.suggestionTags[1].tag).toBe('tag_number_02')
    })

    it('should hide already selected tags from suggestions', () => {
      wrapper.vm.$set(wrapper.vm, 'tags', [{ tag: 'tag_01' }])
      wrapper.vm.$set(wrapper.vm, 'tag', 'tag_01')

      wrapper.vm.searchTags()

      expect(wrapper.vm.suggestionTags).toHaveLength(0)
    })

    it('should set the clicked item in tags', () => {
      wrapper = mount(BatchSearchForm, { i18n, localVue, store, wait })
      wrapper.vm.$set(wrapper.vm, 'tags', [{ tag: 'tag_01' }])
      wrapper.vm.$set(wrapper.vm, 'selectedTag', { tag: 'tag_02' })

      wrapper.vm.searchTag()

      expect(wrapper.vm.tags).toEqual([{ tag: 'tag_01' }, { tag: 'tag_02' }])
    })
  })

  describe('buildTreeFromPaths', () => {
    it('should extract all the first level paths', () => {
      const tree = wrapper.vm.buildTreeFromPaths(['/folder_01', '/folder_02', '/folder_03'])

      expect(tree).toEqual(['folder_01', 'folder_02', 'folder_03'])
    })

    it('should extract all the levels of the path', () => {
      const tree = wrapper.vm.buildTreeFromPaths(['/folder_01/folder_02/folder_03'])

      expect(tree).toEqual(['folder_01', 'folder_01/folder_02', 'folder_01/folder_02/folder_03'])
    })

    it('should filter by uniq paths', () => {
      const tree = wrapper.vm.buildTreeFromPaths(['/folder_01/folder_02', '/folder_01/folder_03'])

      expect(tree).toEqual(['folder_01', 'folder_01/folder_02', 'folder_01/folder_03'])
    })

    it('should filter off the dataDir', () => {
      const tree = wrapper.vm.buildTreeFromPaths(['/root/project/folder_01'])

      expect(tree).toEqual(['folder_01'])
    })
  })

  describe('should load contentTypes from the current project', () => {
    beforeEach(async () => {
      await wrapper.setData({ allFileTypes: [] })
      await wrapper.setData({ showAdvancedFilters: true })
    })

    it('should call retrieveFileTypes on showAdvancedFilters change', async () => {
      jest.spyOn(wrapper.vm, 'retrieveFileTypes')
      await wrapper.setData({ showAdvancedFilters: false })

      expect(wrapper.vm.retrieveFileTypes).toBeCalled()
    })

    it('should return all the content types', async () => {
      await letData(es).have(new IndexedDocument('document_01', project).withContentType('contentType_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', project).withContentType('contentType_02')).commit()
      await letData(es).have(new IndexedDocument('document_03', project).withContentType('contentType_03')).commit()
      await letData(es).have(new IndexedDocument('document_04', project).withContentType('contentType_04')).commit()
      await letData(es).have(new IndexedDocument('document_05', project).withContentType('contentType_05')).commit()
      await letData(es).have(new IndexedDocument('document_06', project).withContentType('contentType_06')).commit()
      await letData(es).have(new IndexedDocument('document_07', project).withContentType('contentType_07')).commit()
      await letData(es).have(new IndexedDocument('document_08', project).withContentType('contentType_08')).commit()
      await letData(es).have(new IndexedDocument('document_09', project).withContentType('contentType_09')).commit()
      await letData(es).have(new IndexedDocument('document_10', project).withContentType('contentType_10')).commit()
      await letData(es).have(new IndexedDocument('document_11', project).withContentType('contentType_11')).commit()

      await wrapper.vm.retrieveFileTypes()

      expect(wrapper.vm.allFileTypes).toHaveLength(11)
    })

    it('should return content type description if exists', async () => {
      await letData(es).have(new IndexedDocument('document', project).withContentType('application/pdf')).commit()

      await wrapper.vm.retrieveFileTypes()

      expect(wrapper.vm.allFileTypes).toEqual([
        {
          extensions: ['.pdf'],
          label: 'Portable Document Format (PDF)',
          mime: 'application/pdf'
        }
      ])
    })

    it('should return content type itself if content type description does NOT exist', async () => {
      await letData(es).have(new IndexedDocument('document', project).withContentType('application/test')).commit()

      await wrapper.vm.retrieveFileTypes()

      expect(wrapper.vm.allFileTypes).toEqual([
        {
          extensions: [],
          label: 'application/test',
          mime: 'application/test'
        }
      ])
    })
  })

  describe('setPaths', () => {
    it('should set paths from selected ones', () => {
      wrapper.vm.$set(wrapper.vm, 'paths', ['path_01', 'path_02'])
      wrapper.vm.$set(wrapper.vm, 'selectedPaths', ['path_02', 'path_03'])

      wrapper.vm.setPaths()

      expect(wrapper.vm.paths).toEqual(['path_02', 'path_03'])
      expect(wrapper.vm.selectedPaths).toEqual(['path_02', 'path_03'])
    })

    it('should reset the path', () => {
      wrapper.vm.$set(wrapper.vm, 'path', 'path_00')

      wrapper.vm.setPaths()

      expect(wrapper.vm.path).toBe('/root/project')
    })
  })
})
