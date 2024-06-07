import Murmur from '@icij/murmur-next'
import  {createRouter, createWebHashHistory} from 'vue-router'
import { shallowMount } from '@vue/test-utils'

import BatchSearchCopyForm from '@/components/BatchSearchCopyForm'
import CoreSetup from "~tests/unit/CoreSetup";

describe('BatchSearchCopyForm.vue', () => {
  let wrapper, plugins, router, store
  const api = {
    copyBatchSearch: vi.fn()
  }
  beforeAll(() => {

    Murmur.config.merge({ mode: 'SERVER' })

    const core = CoreSetup.init(api).useAll().useRouter()
    router = core.router
    store = core.store
    plugins = [core.plugin, core.store, core.i18n, core.router]
  })


  beforeEach(async () => {
    await router.push({ name: 'task.batch-search.view.results', params: {indices: "test", uuid: "12"} })
    const props = {
      batchSearch: {
        uuid: '12',
        project: 'BatchSearchCopyForm',
        name: 'BatchSearch Test',
        description: 'This is the description of the batch search'
      }
    }
    wrapper = shallowMount(BatchSearchCopyForm, { props, global: {
        plugins,
        renderStubDefaultSlot: true,
        stubs: {
          BFormInput:false,
          BFormGroup:false,
          BFormCheckbox:false
        }}, router })

  })

  it("should contain a form",()=>{
    expect(wrapper.find(".batch-search-copy-form").exists()).toBe(true)
  })

  it('should display default values for name and description on BS relaunch form', () => {
    expect(wrapper.vm.name).toBe('BatchSearch Test')
    expect(wrapper.vm.description).toBe('This is the description of the batch search')
  })
  it("should contain a button of type submit ",async ()=>{
    expect(wrapper.find(".batch-search-copy-form__submit").exists()).toBe(true)
    expect(wrapper.find(".batch-search-copy-form__submit").attributes('type')).toBe("submit")
  })
  it('should call the store to delete the BS when deleteAfterRelaunch is checked', async () => {
    const storeDispatchMock = vi.spyOn(store, 'dispatch')
    const nameInput = wrapper.find('.batch-search-copy-form__input__name')
    await nameInput.setValue('Test' )
    const deleteAfterRelaunch = wrapper.find('.batch-search-copy-form__input__delete')
    await deleteAfterRelaunch.setValue( true )
    await wrapper.find('.batch-search-copy-form').trigger('submit.prevent')
    expect(storeDispatchMock).toBeCalled()
    expect(storeDispatchMock).toBeCalledWith('batchSearch/deleteBatchSearch', { batchId: '12' })
  })
  it('should call the API copyBatchSearch method on click on submit button', async () => {
    const copyBatchSearchMock = vi.spyOn(api, 'copyBatchSearch')
    const nameInput = wrapper.find('.batch-search-copy-form__input__name')
    await nameInput.setValue('Test' )
    await wrapper.find('.batch-search-copy-form').trigger('submit.prevent')
    expect(copyBatchSearchMock).toHaveBeenCalledTimes(1)
    expect(copyBatchSearchMock).toHaveBeenCalledWith("12","Test","This is the description of the batch search")
  })

})
