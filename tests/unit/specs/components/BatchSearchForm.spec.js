import BatchSearchForm from '@/components/BatchSearchForm'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import Murmur from '@icij/murmur'
import { App } from '@/main'

const { localVue } = App.init(createLocalVue()).useAll()

jest.mock('lodash/throttle', () => jest.fn(fn => fn))

describe('BatchSearchForm.vue', () => {
  let actions, wrapper

  beforeAll(() => Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX] }))

  beforeEach(() => {
    const state = { batchSearches: [] }
    actions = { onSubmit: jest.fn(), getBatchSearches: jest.fn() }
    const store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, state, actions }, search: { namespaced: true, actions: { queryFacet: jest.fn() } } } })
    wrapper = shallowMount(BatchSearchForm, { localVue, store, mocks: { $t: msg => msg } })
  })

  afterAll(() => jest.unmock('lodash/throttle'))

  it('should call the store action on form submit and reset the form', async () => {
    jest.spyOn(wrapper.vm, 'resetForm')

    await wrapper.vm.onSubmit()

    expect(actions.onSubmit).toBeCalled()
    expect(wrapper.vm.resetForm).toBeCalled()
  })

  it('should display a form with 6 fields: name, file, fuzziness, file type, description and phraseMatch', () => {
    expect(wrapper.findAll('.card-body b-form-group-stub')).toHaveLength(7)
    expect(wrapper.findAll('.card-body b-form-input-stub')).toHaveLength(4)
    expect(wrapper.findAll('.card-body b-form-file-stub')).toHaveLength(1)
    expect(wrapper.findAll('.card-body b-form-textarea-stub')).toHaveLength(1)
    expect(wrapper.findAll('.card-body b-form-checkbox-stub')).toHaveLength(1)
  })

  it('should reset the form', () => {
    wrapper.vm.$set(wrapper.vm, 'name', 'Example')
    wrapper.vm.$set(wrapper.vm, 'published', false)
    wrapper.vm.$set(wrapper.vm, 'csvFile', new File(['File content'], 'test_file.csv', { type: 'text/csv' }))
    wrapper.vm.$set(wrapper.vm, 'description', 'This is a description')
    wrapper.vm.$set(wrapper.vm, 'project', 'project-example')
    wrapper.vm.$set(wrapper.vm, 'fileTypes', '')
    wrapper.vm.$set(wrapper.vm, 'paths', 'This a multiple paths')
    wrapper.vm.$set(wrapper.vm, 'phraseMatch', false)

    wrapper.vm.resetForm()

    expect(wrapper.vm.name).toBe('')
    expect(wrapper.vm.published).toBeTruthy()
    expect(wrapper.vm.csvFile).toBeNull()
    expect(wrapper.vm.description).toBe('')
    expect(wrapper.vm.project).toBe('local-datashare')
    expect(wrapper.vm.fileTypes).toBe('')
    expect(wrapper.vm.paths).toBe('')
    expect(wrapper.vm.phraseMatch).toBeTruthy()
  })

  describe('FileTypes suggestions', () => {
    it('should display suggestions', () => {
      expect(wrapper.contains('selectable-dropdown-stub')).toBeTruthy()
    })

    it('should filter fileTypes according to the fileTypes input', () => {
      wrapper.vm.$set(wrapper.vm, 'fileTypes', 'visi')

      wrapper.vm.searchFileTypes()

      expect(wrapper.vm.suggestionFileTypes).toHaveLength(2)
      expect(wrapper.vm.suggestionFileTypes[0].label).toBe('Visio document')
      expect(wrapper.vm.suggestionFileTypes[1].label).toBe('StarWriter 5 document')
    })

    it('should filter in types label', async () => {
      wrapper.vm.$set(wrapper.vm, 'fileTypes', 'PDF')

      wrapper.vm.searchFileTypes()

      expect(wrapper.vm.suggestionFileTypes).toHaveLength(1)
      expect(wrapper.vm.suggestionFileTypes[0].label).toBe('Portable Document Format (PDF)')
    })

    it('should set the clicked item in the fileTypes input', () => {
      wrapper.vm.$set(wrapper.vm, 'fileTypes', 'Excel 2003 XML spreadsheet visio')
      wrapper.vm.searchFileType({ label: 'StarWriter 5 document' })

      expect(wrapper.vm.fileTypes).toBe('Excel 2003 XML spreadsheet StarWriter 5 document')
    })
  })
})
