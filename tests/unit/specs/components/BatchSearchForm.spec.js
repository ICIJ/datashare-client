import BatchSearchForm from '@/components/BatchSearchForm'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Murmur)
localVue.use(BootstrapVue)

describe('BatchSearchForm', () => {
  let actions, wrapper

  beforeAll(() => Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX] }))

  beforeEach(() => {
    const state = {
      batchSearches: []
    }
    actions = {
      onSubmit: jest.fn(),
      getBatchSearches: jest.fn()
    }
    const store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, state, actions } } })
    wrapper = shallowMount(BatchSearchForm, { localVue, store, mocks: { $t: msg => msg } })
  })

  it('should call the store', () => {
    wrapper.vm.onSubmit()

    expect(actions.onSubmit).toBeCalled()
  })

  it('should display a form with 4 fields: name, published, file and description', () => {
    expect(wrapper.find('b-form-group-stub[labelfor=name] b-form-input-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-form-group-stub[label="batchSearch.published"] b-form-radio-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-form-group-stub[labelfor=file] b-form-file-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-form-group-stub[labelfor=description] b-form-textarea-stub').exists()).toBeTruthy()
  })
})
