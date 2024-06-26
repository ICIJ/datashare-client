import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import { beforeEach, describe } from 'vitest'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import BatchSearchForm from '@/components/BatchSearchForm'
import CoreSetup from '~tests/unit/CoreSetup'

describe('BatchSearchForm.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  let core, config, wrapper
  const api = { elasticsearch: es }
  const actions = { onSubmit: vi.fn(), getBatchSearches: vi.fn() }
  const state = { batchSearches: [] }

  beforeAll(() => {
    const storeOptions = {
      modules: {
        batchSearch: { namespaced: true, state, actions },
        search: { namespaced: true, actions: { queryFilter: vi.fn() } }
      }
    }

    core = CoreSetup.init(api).useAll(storeOptions)
    config = core.config

    config.set('projects', [{ name: project }])
    config.set('dataDir', '/root/project')
  })

  afterEach(() => {
    actions.onSubmit.mockReset()
  })

  describe('on LOCAL mode', () => {
    beforeEach(async () => {
      config.merge({ mode: 'LOCAL' })
      wrapper = shallowMount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
    })

    it('should display a form with 7 fields: name, csvFile, description, phraseMatch, fuzziness, fileTypes and paths on LOCAL', () => {
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

  describe('on SERVER mode', () => {
    let wrapper

    beforeEach(() => {
      config.merge({ mode: 'SERVER' })
      wrapper = shallowMount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
    })

    it('should display "Published" button', () => {
      expect(wrapper.find('.batch-search-form__published').exists()).toBe(true)
    })
    it('should display a project selector', () => {
      expect(wrapper.find('.batch-search-form__projects').exists()).toBe(true)
    })

    describe('On project change', () => {
      it('should reset fileType and tag', async () => {
        await wrapper.setData({ fileType: 'fileTypeTest', tag: 'tagTest' })
        await wrapper.setData({ selectedProjects: [anotherProject] })
        expect(wrapper.vm.fileType).toBe('')
        expect(wrapper.vm.tag).toBe('')
      })

      it('should reset fileTypes, tags and paths', async () => {
        await wrapper.setData({
          fileTypes: ['fileType_01', 'fileType_02'],
          tags: ['tag_01', 'tag_02'],
          paths: ['path_01', 'path_02'],
          selectedProjects: [anotherProject]
        })

        expect(wrapper.vm.fileTypes).toEqual([])
        expect(wrapper.vm.paths).toEqual([])
        expect(wrapper.vm.tags).toEqual([])
      })

      it('should reset allFileTypes', async () => {
        await wrapper.setData({
          allFileTypes: ['fileType_01', 'fileType_02'],
          selectedProjects: [anotherProject]
        })

        expect(wrapper.vm.allFileTypes).toEqual([])
      })

      it('should reset allTags', async () => {
        await wrapper.setData({
          allTags: ['tag_01', 'tag_02'],
          selectedProjects: [anotherProject]
        })

        expect(wrapper.vm.allTags).toEqual([])
      })

      it('should call hideSuggestionsFileTypes and hideSuggestionsTags', async () => {
        vi.spyOn(wrapper.vm, 'hideSuggestionsFileTypes')
        vi.spyOn(wrapper.vm, 'hideSuggestionsTags')
        await wrapper.setData({ selectedProjects: [anotherProject] })

        expect(wrapper.vm.hideSuggestionsFileTypes).toBeCalled()
        expect(wrapper.vm.hideSuggestionsTags).toBeCalled()
      })

      it('should call retrieveFileTypes', async () => {
        vi.spyOn(wrapper.vm, 'retrieveFileTypes')
        await wrapper.setData({ selectedProjects: [anotherProject] })

        expect(wrapper.vm.retrieveFileTypes).toBeCalled()
      })

      it('should call retrieveTags', async () => {
        vi.spyOn(wrapper.vm, 'retrieveTags')
        await wrapper.setData({ selectedProjects: [anotherProject] })

        expect(wrapper.vm.retrieveTags).toBeCalled()
      })
    })
  })

  describe('on all modes', () => {
    beforeEach(async () => {
      wrapper = shallowMount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
    })

    it('should call the store action on form submit and reset the form', async () => {
      const spyReset = vi.spyOn(wrapper.vm, 'resetForm')

      await wrapper.vm.onSubmit()

      expect(actions.onSubmit).toBeCalled()
      expect(spyReset).toHaveBeenCalledTimes(1)
    })

    it('should reset the form', async () => {
      await wrapper.setData({
        csvFile: new File(['File content'], 'test_file.csv', { type: 'text/csv' }),
        description: 'This is a description',
        fileType: 'PDF',
        fileTypes: [{ label: 'PDF' }],
        tag: 'foo',
        tags: ['foo'],
        selectedFuzziness: 2,
        name: 'Example',
        paths: ['This', 'is', 'a', 'multiple', 'paths'],
        phraseMatch: false,
        excludeTags: true,
        selectedProjects: ['project-example'],
        published: false,
        showAdvancedFilters: true
      })

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
      expect(wrapper.vm.excludeTags).toBe(false)
      expect(wrapper.vm.projects).toContainEqual(project)
      expect(wrapper.vm.published).toBe(true)
      expect(wrapper.vm.showAdvancedFilters).toBe(false)
    })

    it('should set the fuzziness (without phraseMatch) to 0 when the input is below than 0', async () => {
      await wrapper.setData({ phraseMatch: false })
      wrapper.vm.fuzziness = -7
      expect(wrapper.vm.fuzziness).toBe(0)
    })

    it('should set the fuzziness (without phraseMatch) to 2 when the input is higher than maxFuzziness', async () => {
      await wrapper.setData({ phraseMatch: false })
      wrapper.vm.fuzziness = 12
      expect(wrapper.vm.fuzziness).toBe(2)
    })

    it('should reset the fuzziness to 0 on phraseMatch change', async () => {
      wrapper.vm.fuzziness = 2
      await wrapper.setData({ phraseMatch: false })

      expect(wrapper.vm.fuzziness).toBe(0)
    })

    describe('FileTypes suggestions', () => {
      let wrapper

      beforeEach(() => {
        wrapper = shallowMount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
      })

      it('should display suggestions', () => {
        expect(wrapper.find('.batch-search-form__fileTypes__suggestions').exists()).toBe(true)
      })

      it('should hide suggestions', async () => {
        await wrapper.setData({ suggestionFileTypes: ['suggestion_01', 'suggestion_02', 'suggestion_03'] })

        wrapper.vm.hideSuggestionsFileTypes()

        expect(wrapper.vm.suggestionFileTypes).toEqual([])
      })

      it('should filter fileTypes according to the fileTypes input on mime file', async () => {
        await wrapper.setData({
          fileType: 'visi',
          allFileTypes: [
            { label: 'Visio document', mime: 'visio' },
            { label: 'StarWriter 5 document', mime: 'vision' },
            { label: 'Something else', mime: 'else' }
          ]
        })

        wrapper.vm.searchFileTypes()

        expect(wrapper.vm.suggestionFileTypes).toHaveLength(2)
        expect(wrapper.vm.suggestionFileTypes[0].label).toBe('Visio document')
        expect(wrapper.vm.suggestionFileTypes[1].label).toBe('StarWriter 5 document')
      })

      it('should filter according to the fileTypes input on label file', async () => {
        await wrapper.setData({
          fileType: 'another',
          allFileTypes: [
            { label: 'Label PDF', mime: 'PDF' },
            { label: 'another type', mime: 'other' }
          ]
        })

        wrapper.vm.searchFileTypes()
        await flushPromises()

        expect(wrapper.vm.suggestionFileTypes).toHaveLength(1)
        expect(wrapper.vm.suggestionFileTypes[0].label).toBe('another type')
      })

      it('should hide already selected file type from suggestions', async () => {
        await wrapper.setData({
          selectedFileType: [{ label: 'Portable Document Format (PDF)' }],
          allFileTypes: [{ mime: 'application/pdf', label: 'Portable Document Format (PDF)' }]
        })

        wrapper.vm.searchFileTypes()
        await flushPromises()

        expect(wrapper.vm.suggestionFileTypes).toHaveLength(0)
      })

      it('should set the clicked item in fileTypes', async () => {
        wrapper = mount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
        await flushPromises()
        await wrapper.setData({
          fileTypes: [{ label: 'Excel 2003 XML spreadsheet visio' }],
          selectedFileType: { label: 'StarWriter 5 document' }
        })
        wrapper.vm.searchFileType()

        expect(wrapper.vm.fileTypes).toEqual([
          { label: 'Excel 2003 XML spreadsheet visio' },
          { label: 'StarWriter 5 document' }
        ])
      })
    })

    describe('Tags suggestions', () => {
      let wrapper

      beforeEach(() => {
        wrapper = shallowMount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
      })

      it('should display suggestions', () => {
        expect(wrapper.find('.batch-search-form__tags__suggestions').exists()).toBe(true)
      })

      it('should hide suggestions', async () => {
        await wrapper.setData({ suggestionTags: ['suggestion_01', 'suggestion_02', 'suggestion_03'] })

        wrapper.vm.hideSuggestionsTags()

        expect(wrapper.vm.suggestionTags).toEqual([])
      })

      it('should filter tags', async () => {
        await wrapper.setData({
          tag: 'tag_0',
          allTags: ['tag_01', 'tag_02', 'another_03']
        })

        wrapper.vm.searchTags()

        expect(wrapper.vm.suggestionTags).toHaveLength(2)
        expect(wrapper.vm.suggestionTags[0]).toBe('tag_01')
        expect(wrapper.vm.suggestionTags[1]).toBe('tag_02')
      })

      it('should hide already selected tag from suggestions', async () => {
        await wrapper.setData({ tags: ['tag_01'], fileType: 'tag_0' })

        wrapper.vm.searchTags()

        expect(wrapper.vm.suggestionTags).toHaveLength(0)
      })

      it('should set the clicked item in tags', async () => {
        wrapper = mount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
        await flushPromises()
        await wrapper.setData({ tags: ['tag_01'], selectedTag: 'tag_02' })

        wrapper.vm.searchTag()

        expect(wrapper.vm.tags).toEqual(['tag_01', 'tag_02'])
      })
    })

    describe('Generate ES query body', () => {
      let wrapper

      beforeEach(() => {
        wrapper = shallowMount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
      })

      it('should build query body', async () => {
        expect(wrapper.vm.queryWithFilters).toEqual(
          JSON.stringify({
            bool: {
              must: [
                { match_all: {} },
                { bool: { should: [{ query_string: { query: '<query>' } }] } },
                { match: { type: 'Document' } }
              ]
            }
          })
        )
      })

      it('should build query with listed tags when they are selected', async () => {
        await wrapper.setData({ tags: ['tag_01', 'tag_02'] })
        expect(wrapper.vm.queryWithFilters).toEqual(
          JSON.stringify({
            bool: {
              filter: { terms: { tags: ['tag_01', 'tag_02'] } },
              must: [
                { match_all: {} },
                { bool: { should: [{ query_string: { query: '<query>' } }] } },
                { match: { type: 'Document' } }
              ]
            }
          })
        )
      })

      it('should build query with excluded tags', async () => {
        await wrapper.setData({ tags: ['tag_01'], excludeTags: true })
        expect(wrapper.vm.queryWithFilters).toEqual(
          JSON.stringify({
            bool: {
              filter: { bool: { must_not: [{ terms: { tags: ['tag_01'] } }] } },
              must: [
                { match_all: {} },
                { bool: { should: [{ query_string: { query: '<query>' } }] } },
                { match: { type: 'Document' } }
              ]
            }
          })
        )
      })

      it('should build query with listed tags, paths and fileTypes when they are selected', async () => {
        const fileType = {
          extensions: ['fileType_01_extension'],
          label: 'fileType_01_label',
          mime: 'fileType_01_mime',
          recycle_id_scroller: 'fileType_01_id'
        }
        await wrapper.setData({ tags: ['tag_01', 'tag_02'], fileTypes: [fileType], paths: ['path_01', 'path_02'] })
        expect(wrapper.vm.queryWithFilters).toEqual(
          JSON.stringify({
            bool: {
              filter: {
                bool: {
                  must: [{ terms: { tags: ['tag_01', 'tag_02'] } }, { terms: { contentType: ['fileType_01_mime'] } }]
                }
              },
              must: [
                {
                  bool: { should: [{ term: { 'dirname.tree': 'path_01' } }, { term: { 'dirname.tree': 'path_02' } }] }
                },
                { match_all: {} },
                { bool: { should: [{ query_string: { query: '<query>' } }] } },
                { match: { type: 'Document' } }
              ]
            }
          })
        )
      })
    })

    describe('buildTreeFromPaths', () => {
      let wrapper

      beforeEach(() => {
        wrapper = shallowMount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
      })

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
      let wrapper

      beforeEach(async () => {
        wrapper = shallowMount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
        await wrapper.setData({ allFileTypes: [], showAdvancedFilters: true })
      })

      it('should call retrieveFileTypes on showAdvancedFilters change', async () => {
        vi.spyOn(wrapper.vm, 'retrieveFileTypes')
        await wrapper.setData({ showAdvancedFilters: false })

        expect(wrapper.vm.retrieveFileTypes).toBeCalled()
      })

      it('should return all the content types', async () => {
        await letData(es).have(new IndexedDocument('document_01', project).withContentType('contentType_01')).commit()
        await letData(es).have(new IndexedDocument('document_02', project).withContentType('contentType_02')).commit()
        await letData(es).have(new IndexedDocument('document_03', project).withContentType('contentType_03')).commit()

        await wrapper.vm.retrieveFileTypes()

        expect(wrapper.vm.allFileTypes).toHaveLength(3)
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

    describe('should load tags from the current project', () => {
      let wrapper

      beforeEach(async () => {
        wrapper = shallowMount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
        await wrapper.setData({ allTags: [], showAdvancedFilters: true })
      })

      it('should call retrieveTags on showAdvancedFilters change', async () => {
        vi.spyOn(wrapper.vm, 'retrieveTags')
        await wrapper.setData({ showAdvancedFilters: false })

        expect(wrapper.vm.retrieveTags).toBeCalled()
      })

      it('should return all the tags', async () => {
        await letData(es)
          .have(new IndexedDocument('document_01', project).withTags(['tag_01']))
          .commit()
        await letData(es)
          .have(new IndexedDocument('document_02', project).withTags(['tag_02']))
          .commit()
        await letData(es)
          .have(new IndexedDocument('document_03', project).withTags(['tag_03']))
          .commit()

        await wrapper.vm.retrieveTags()

        expect(wrapper.vm.allTags).toHaveLength(3)
      })
    })

    describe('setPaths', () => {
      let wrapper

      beforeEach(() => {
        wrapper = shallowMount(BatchSearchForm, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
      })

      it('should set paths from selected ones', async () => {
        await wrapper.setData({ paths: ['path_01', 'path_02'], selectedPaths: ['path_02', 'path_03'] })

        wrapper.vm.setPaths()

        expect(wrapper.vm.paths).toEqual(['path_02', 'path_03'])
        expect(wrapper.vm.selectedPaths).toEqual(['path_02', 'path_03'])
      })
    })
  })
})
