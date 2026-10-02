import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchForm from '@/components/Task/TaskBatchSearch/TaskBatchSearchForm'
import { apiInstance as api } from '@/api/apiInstance'
import { BATCH_SEARCH_CSV_FILE, BATCH_SEARCH_CSV_STRING } from '@/enums/batchSearch'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    batchSearch: vi.fn(),
    elasticsearch: {
      rootSearch: vi.fn().mockReturnValue({
        build: vi.fn().mockReturnValue({ query: { match_all: {} } })
      })
    }
  }
}))

describe('TaskBatchSearchForm', () => {
  let plugins

  beforeEach(() => {
    vi.clearAllMocks()
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    core.config.set('projects', [{ name: 'local-datashare' }])
    core.config.set('defaultProject', 'local-datashare')
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  function createValidWrapper() {
    const wrapper = shallowMount(TaskBatchSearchForm, { global: { plugins } })
    // Directly set internal refs to make the form valid (name + csv).
    // setupState auto-unwraps refs, so we assign values directly.
    wrapper.vm.$.setupState.name = 'Test Batch Search'
    wrapper.vm.$.setupState.csvTab = BATCH_SEARCH_CSV_STRING
    wrapper.vm.$.setupState.csvString = 'test query'
    return wrapper
  }

  it('shows a success toast when batch search is created', async () => {
    api.batchSearch.mockResolvedValue('task-id-123')
    const wrapper = createValidWrapper()
    vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()
    vi.spyOn(wrapper.vm.$toast, 'success')
    vi.spyOn(wrapper.vm.$toast, 'error')

    await wrapper.find('form-creation-stub').trigger('submit')
    await vi.waitFor(() => {
      expect(api.batchSearch).toHaveBeenCalledOnce()
      expect(wrapper.vm.$toast.success).toHaveBeenCalledOnce()
    })

    expect(wrapper.vm.$toast.error).not.toHaveBeenCalled()
  })

  it('shows an error toast when batch search creation fails', async () => {
    api.batchSearch.mockRejectedValue(new Error('500 Internal Server Error'))
    const wrapper = createValidWrapper()
    vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()
    vi.spyOn(wrapper.vm.$toast, 'success')
    vi.spyOn(wrapper.vm.$toast, 'error')

    await wrapper.find('form-creation-stub').trigger('submit')
    await vi.waitFor(() => {
      expect(api.batchSearch).toHaveBeenCalledOnce()
      expect(wrapper.vm.$toast.error).toHaveBeenCalledOnce()
    })

    expect(wrapper.vm.$toast.success).not.toHaveBeenCalled()
  })

  it('shows a specific error toast when the queries file cannot be read', async () => {
    const wrapper = createValidWrapper()
    const csvFile = new File(['test query'], 'queries.csv', { type: 'text/csv' })
    csvFile.text = vi.fn().mockRejectedValue(new DOMException('File moved', 'NotReadableError'))
    wrapper.vm.$.setupState.csvTab = BATCH_SEARCH_CSV_FILE
    wrapper.vm.$.setupState.csvFile = csvFile
    vi.spyOn(wrapper.vm.$toast, 'error')

    await wrapper.find('form-creation-stub').trigger('submit')
    await vi.waitFor(() => expect(wrapper.vm.$toast.error).toHaveBeenCalledOnce())

    expect(wrapper.vm.$toast.error).toHaveBeenCalledWith(wrapper.vm.$t('task.batch-search.form.readError'))
    expect(api.batchSearch).not.toHaveBeenCalled()
  })

  describe('smart quotes in the uploaded queries (icij/datashare#2352)', () => {
    async function submittedQueries(wrapper) {
      vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()
      await wrapper.find('form-creation-stub').trigger('submit')
      await vi.waitFor(() => expect(api.batchSearch).toHaveBeenCalledOnce())
      const [, file] = api.batchSearch.mock.calls.at(-1)
      return file.text()
    }

    beforeEach(() => {
      api.batchSearch.mockResolvedValue('task-id-123')
    })

    it('straightens the smart-quoted phrases pasted in the textarea', async () => {
      const wrapper = createValidWrapper()
      wrapper.vm.$.setupState.csvString = '“test full sentence”\n「東京」'
      expect(await submittedQueries(wrapper)).toBe('"test full sentence"\n"東京"')
    })

    it('straightens the smart-quoted phrases of an uploaded file', async () => {
      const wrapper = createValidWrapper()
      wrapper.vm.$.setupState.csvTab = BATCH_SEARCH_CSV_FILE
      wrapper.vm.$.setupState.csvFile = new File(['“test full sentence”\n「東京」'], 'queries.csv', { type: 'text/csv' })
      expect(await submittedQueries(wrapper)).toBe('"test full sentence"\n"東京"')
    })

    it('never lets a phrase span two queries', async () => {
      const wrapper = createValidWrapper()
      wrapper.vm.$.setupState.csvString = '“test\nsentence”'
      expect(await submittedQueries(wrapper)).toBe('“test\nsentence”')
    })

    it('keeps the line endings and the escaped quotes as they are', async () => {
      const wrapper = createValidWrapper()
      wrapper.vm.$.setupState.csvString = '\\“test”\r\nplain\n'
      expect(await submittedQueries(wrapper)).toBe('\\“test”\r\nplain\n')
    })

    it('keeps the smart quotes when phrase match is on', async () => {
      const wrapper = createValidWrapper()
      wrapper.vm.$.setupState.csvString = '“test full sentence”\n「東京」'
      wrapper.vm.$.setupState.phraseMatch = true
      expect(await submittedQueries(wrapper)).toBe('“test full sentence”\n「東京」')
    })

    it('keeps the smart quotes when spelling changes are allowed', async () => {
      const wrapper = createValidWrapper()
      wrapper.vm.$.setupState.csvString = '“test full sentence”\n「東京」'
      wrapper.vm.$.setupState.spellingChanges = 1
      expect(await submittedQueries(wrapper)).toBe('“test full sentence”\n「東京」')
    })
  })

  describe('locked filters kept in the batch search query/uri (icij/datashare#2331 reverted)', () => {
    it('calls rootSearch with instantiatedFilters, including a locked value, in the query template', async () => {
      const { useLockedFiltersStore } = await import('@/store/modules')
      const lockedFiltersStore = useLockedFiltersStore()

      const wrapper = createValidWrapper()
      const { formSearchStore } = wrapper.vm.$.setupState
      formSearchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })
      await wrapper.vm.$nextTick()

      // Access the computed to trigger evaluation.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      wrapper.vm.$.setupState.queryTemplate

      const [passedFilters] = api.elasticsearch.rootSearch.mock.calls.at(-1)
      const contentTypeFilter = passedFilters.find(filter => filter.name === 'contentType')
      expect(contentTypeFilter.values).toEqual(['application/pdf'])
    })

    it('keeps a locked value in the batch search uri', async () => {
      const { useLockedFiltersStore } = await import('@/store/modules')
      const lockedFiltersStore = useLockedFiltersStore()

      const wrapper = createValidWrapper()
      const { formSearchStore } = wrapper.vm.$.setupState
      formSearchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })
      await wrapper.vm.$nextTick()

      const { uri } = wrapper.vm.$.setupState
      expect(decodeURIComponent(uri)).toContain('f[contentType]')
    })

    it('keeps a ticked-but-unlocked value in the batch search uri', async () => {
      const wrapper = createValidWrapper()
      const { formSearchStore } = wrapper.vm.$.setupState
      formSearchStore.addFilterValue({ name: 'contentType', value: 'text/plain' })
      await wrapper.vm.$nextTick()

      const { uri } = wrapper.vm.$.setupState
      expect(decodeURIComponent(uri)).toContain('f[contentType]')
    })
  })
})
