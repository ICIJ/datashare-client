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
    expect(f.fuzzyDistance).toBe(0)
    expect(f.proximityPhrase).toBe('')
    expect(f.proximityDistance).toBe(0)
    expect(f.fieldAll).toBe(true)
    expect(f.selectedFields).toEqual([])
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
    const [[query]] = wrapper.emitted('search')
    expect(query).toContain('foo')
    expect(query).toContain('bar')
  })

  it('keeps the exact phrase as a single quoted phrase', () => {
    const wrapper = factory()
    wrapper.vm.form.exactPhrase = 'Société SAS'
    wrapper.vm.handleSearch()
    const [[query]] = wrapper.emitted('search')
    expect(query).toContain('"Société SAS"')
  })

  it('closes the modal after a successful search', () => {
    const wrapper = factory()
    wrapper.vm.form.anyWords = 'foo'
    wrapper.vm.handleSearch()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe(false)
  })

  it('Reset clears every entry and re-selects "All fields"', () => {
    const wrapper = factory()
    wrapper.vm.form.anyWords = 'foo'
    wrapper.vm.form.fuzzyTerm = 'Mercedes'
    wrapper.vm.form.fieldAll = false
    wrapper.vm.form.selectedFields = ['tags']
    wrapper.vm.handleReset()
    expect(wrapper.vm.form.anyWords).toBe('')
    expect(wrapper.vm.form.fuzzyTerm).toBe('')
    expect(wrapper.vm.form.fieldAll).toBe(true)
    expect(wrapper.vm.form.selectedFields).toEqual([])
  })
})
