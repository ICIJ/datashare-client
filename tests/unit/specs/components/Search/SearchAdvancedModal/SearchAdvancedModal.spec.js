import { nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchAdvancedModal from '@/components/Search/SearchAdvancedModal/SearchAdvancedModal'

describe('SearchAdvancedModal.vue', () => {
  const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()

  const factory = (props = { modelValue: true }) => {
    return shallowMount(SearchAdvancedModal, {
      props,
      global: { plugins, renderStubDefaultSlot: true }
    })
  }

  it('exposes a default form value where every input is empty', () => {
    const wrapper = factory()
    const f = wrapper.vm.form
    expect(f.anyWords).toBe('')
    expect(f.allWords).toBe('')
    expect(f.exactPhrase).toBe('')
    expect(f.noneWords).toBe('')
    expect(f.singleWildcardStart).toBe('')
    expect(f.singleWildcardEnd).toBe('')
    expect(f.multiWildcardStart).toBe('')
    expect(f.multiWildcardEnd).toBe('')
    expect(f.fuzzyTerm).toBe('')
    expect(f.fuzzyDistance).toBe(1)
    expect(f.proximityPhrase).toBe('')
    expect(f.proximityDistance).toBe(1)
    expect(f.field).toBe('all')
  })

  it('flags isFormEmpty true on the initial state', () => {
    const wrapper = factory()
    expect(wrapper.vm.isFormEmpty).toBe(true)
  })

  it('flags isFormEmpty false as soon as any word input is populated', async () => {
    const wrapper = factory()
    wrapper.vm.form.anyWords = 'foo'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isFormEmpty).toBe(false)
  })

  it('flags isFormEmpty false as soon as the fuzzy term is populated', async () => {
    const wrapper = factory()
    wrapper.vm.form.fuzzyTerm = 'Mercedes'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isFormEmpty).toBe(false)
  })

  it('treats whitespace-only inputs as empty', async () => {
    const wrapper = factory()
    wrapper.vm.form.anyWords = '   '
    wrapper.vm.form.exactPhrase = '\t\n'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isFormEmpty).toBe(true)
  })

  it('emits a search event with the generated Lucene query, splitting on whitespace', () => {
    const wrapper = factory()
    wrapper.vm.form.anyWords = 'foo bar'
    wrapper.vm.handleSearch()
    expect(wrapper.emitted('search')).toBeTruthy()
    const [[{ query }]] = wrapper.emitted('search')
    expect(query).toContain('foo')
    expect(query).toContain('bar')
  })

  it('keeps the exact phrase as a single quoted phrase', () => {
    const wrapper = factory()
    wrapper.vm.form.exactPhrase = 'Société SAS'
    wrapper.vm.handleSearch()
    const [[{ query }]] = wrapper.emitted('search')
    expect(query).toContain('"Société SAS"')
  })

  it('emits the selected field alongside the query', () => {
    const wrapper = factory()
    wrapper.vm.form.anyWords = 'foo'
    wrapper.vm.form.field = 'tags'
    wrapper.vm.handleSearch()
    const [[payload]] = wrapper.emitted('search')
    expect(payload.field).toBe('tags')
  })

  it('closes the modal after a successful search', () => {
    const wrapper = factory()
    wrapper.vm.form.anyWords = 'foo'
    wrapper.vm.handleSearch()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe(false)
  })

  it('still emits a search and closes when the form is empty so the search is always resubmitted', () => {
    const wrapper = factory()
    wrapper.vm.handleSearch()
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0][0].query).toBe('')
    expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe(false)
  })

  it('re-emits the original query text when the form was not meaningfully changed', async () => {
    // Opening on `Pierre AND Romera` fills allWords; submitting unchanged
    // would regenerate `+Pierre +Romera`. Since that means the same thing,
    // the modal must re-emit the user's original text, not rewrite the bar.
    const wrapper = factory({ modelValue: false, initialQuery: 'Pierre AND Romera' })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    wrapper.vm.handleSearch()
    const [[{ query }]] = wrapper.emitted('search')
    expect(query).toBe('Pierre AND Romera')
  })

  it('emits the regenerated query when the user edits the pre-populated form', async () => {
    const wrapper = factory({ modelValue: false, initialQuery: 'Pierre AND Romera' })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    wrapper.vm.form.allWords = 'Pierre'
    wrapper.vm.handleSearch()
    const [[{ query }]] = wrapper.emitted('search')
    expect(query).toBe('+Pierre')
  })

  it('Reset clears every entry and re-selects the "all" field', () => {
    const wrapper = factory()
    wrapper.vm.form.anyWords = 'foo'
    wrapper.vm.form.fuzzyTerm = 'Mercedes'
    wrapper.vm.form.field = 'tags'
    wrapper.vm.handleReset()
    expect(wrapper.vm.form.anyWords).toBe('')
    expect(wrapper.vm.form.fuzzyTerm).toBe('')
    expect(wrapper.vm.form.field).toBe('all')
  })

  it('pre-populates the form from initialQuery when the modal opens', async () => {
    const wrapper = shallowMount(SearchAdvancedModal, {
      props: { modelValue: false, initialQuery: '+Paris +London' },
      global: { plugins, renderStubDefaultSlot: true }
    })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(wrapper.vm.form.allWords).toBe('Paris London')
  })

  it('opens blank on a field-restricted query — fields are no longer baked into the query', async () => {
    const wrapper = shallowMount(SearchAdvancedModal, {
      props: { modelValue: false, initialQuery: 'tags:(Paris) OR content:(Paris)' },
      global: { plugins, renderStubDefaultSlot: true }
    })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(wrapper.vm.form.anyWords).toBe('')
    expect(wrapper.vm.isFormEmpty).toBe(true)
  })

  it('pre-selects the field from initialField when the modal opens', async () => {
    const wrapper = shallowMount(SearchAdvancedModal, {
      props: { modelValue: false, initialField: 'tags' },
      global: { plugins, renderStubDefaultSlot: true }
    })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(wrapper.vm.form.field).toBe('tags')
  })

  it('pre-populates an AND query into allWords', async () => {
    const wrapper = shallowMount(SearchAdvancedModal, {
      props: { modelValue: false, initialQuery: 'pierre AND romera' },
      global: { plugins, renderStubDefaultSlot: true }
    })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(wrapper.vm.form.allWords).toBe('pierre romera')
    expect(wrapper.vm.form.anyWords).toBe('')
  })

  it('opens blank when initialQuery cannot be faithfully represented', async () => {
    // A hand-written field query would be silently rewritten into a
    // literal-text search on re-submit, so the form must not pre-populate.
    const wrapper = shallowMount(SearchAdvancedModal, {
      props: { modelValue: false, initialQuery: 'content:cat' },
      global: { plugins, renderStubDefaultSlot: true }
    })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(wrapper.vm.form.anyWords).toBe('')
    expect(wrapper.vm.isFormEmpty).toBe(true)
  })

  it('opens blank when initialQuery restricts to any field', async () => {
    const wrapper = shallowMount(SearchAdvancedModal, {
      props: { modelValue: false, initialQuery: 'author:(Paris)' },
      global: { plugins, renderStubDefaultSlot: true }
    })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(wrapper.vm.form.anyWords).toBe('')
    expect(wrapper.vm.form.field).toBe('all')
  })

  it('resets to the initial form when the modal closes', async () => {
    const wrapper = shallowMount(SearchAdvancedModal, {
      props: { modelValue: true, initialQuery: '+Paris' },
      global: { plugins, renderStubDefaultSlot: true }
    })
    await nextTick()
    wrapper.vm.form.fuzzyTerm = 'Mercedes'
    await wrapper.setProps({ modelValue: false })
    await nextTick()
    expect(wrapper.vm.form.allWords).toBe('')
    expect(wrapper.vm.form.fuzzyTerm).toBe('')
  })

  it('remounts the range sliders each session by bumping formKey on open and reset', async () => {
    const wrapper = factory({ modelValue: false })
    const initial = wrapper.vm.formKey

    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(wrapper.vm.formKey).toBe(initial + 1)

    wrapper.vm.handleReset()
    expect(wrapper.vm.formKey).toBe(initial + 2)
  })
})
