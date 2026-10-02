import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchSelectionAddTagsModal from '@/views/Search/SearchSelectionAddTagsModal'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      elasticsearch: {
        search: vi.fn().mockResolvedValue({
          aggregations: {
            agg_terms_tags: {
              buckets: [{ key: 'foo' }, { key: 'bar' }]
            }
          }
        })
      }
    }
  }
})

// The modal is displayed through `app-modal`, whose default slot gives it the
// `visible` flag and the `ok` callback. This stub reproduces that contract
// without mounting the whole bootstrap modal.
const AppModalStub = {
  emits: ['ok'],
  template: `<div><slot :visible="true" :ok="() => $emit('ok')" /></div>`
}

describe('SearchSelectionAddTagsModal.vue', () => {
  let wrapper

  beforeEach(async () => {
    const { plugins } = CoreSetup.init().useAll()

    wrapper = mount(SearchSelectionAddTagsModal, {
      global: { plugins, stubs: { 'app-modal': AppModalStub } },
      props: { indices: ['project'], nbDocs: 3 }
    })

    await flushPromises()
  })

  function findTagInput() {
    return wrapper.find('.form-control-tag-input__form__field')
  }

  it('suggests the existing tags matching the input', async () => {
    await findTagInput().setValue('fo')
    await flushPromises()

    expect(wrapper.find('.form-control-tag-dropdown').text()).toContain('foo')
  })

  it('adds the typed tag on enter without submitting', async () => {
    await findTagInput().setValue('foo')
    await findTagInput().trigger('keydown.enter')
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('.form-control-tag-input-entry').text()).toContain('foo')
  })

  it('submits on enter when the tag input is empty', async () => {
    await findTagInput().setValue('foo')
    await findTagInput().trigger('keydown.enter')
    await flushPromises()
    await findTagInput().trigger('keydown.enter')
    await flushPromises()

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')[0][0].tags).toEqual(['foo'])
  })

  it('does not submit when picking a suggestion with enter', async () => {
    await findTagInput().setValue('bar')
    await findTagInput().trigger('keydown.enter')
    await findTagInput().setValue('fo')
    await findTagInput().trigger('keydown.down')
    await flushPromises()
    await wrapper.find('.dropdown-item').trigger('keydown.enter')
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.findAll('.form-control-tag-input-entry')).toHaveLength(2)
  })

  it('does not submit on enter when no tag was added', async () => {
    await findTagInput().trigger('keydown.enter')
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})
