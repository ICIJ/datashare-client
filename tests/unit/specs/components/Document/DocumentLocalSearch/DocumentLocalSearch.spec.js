import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'
import DocumentLocalSearchNav from '@/components/Document/DocumentLocalSearch/DocumentLocalSearchNav'

describe('DocumentLocalSearch.vue', () => {
  function mountSearch(props = {}) {
    const { plugins } = CoreSetup.init().useAll()
    return shallowMount(DocumentLocalSearch, {
      props: { modelValue: 'foo', activeIndex: 1, occurrences: 3, ...props },
      global: { plugins }
    })
  }

  function nav(wrapper) {
    return wrapper.findComponent(DocumentLocalSearchNav)
  }

  it('disables both arrows without a term', () => {
    const wrapper = mountSearch({ modelValue: '' })
    expect(nav(wrapper).props()).toMatchObject({ disabledPrevious: true, disabledNext: true })
  })

  it('disables both arrows without occurrences', () => {
    const wrapper = mountSearch({ activeIndex: 0, occurrences: 0 })
    expect(nav(wrapper).props()).toMatchObject({ disabledPrevious: true, disabledNext: true })
  })

  it('keeps both arrows enabled with a single occurrence', () => {
    const wrapper = mountSearch({ activeIndex: 1, occurrences: 1 })
    expect(nav(wrapper).props()).toMatchObject({ disabledPrevious: false, disabledNext: false })
  })

  it('moves to the next occurrence', async () => {
    const wrapper = mountSearch({ activeIndex: 1 })
    await nav(wrapper).vm.$emit('next')
    expect(wrapper.emitted('update:activeIndex')).toEqual([[2]])
  })

  it('wraps from the last occurrence to the first', async () => {
    const wrapper = mountSearch({ activeIndex: 3 })
    await nav(wrapper).vm.$emit('next')
    expect(wrapper.emitted('update:activeIndex')).toEqual([[1]])
  })

  it('wraps from the first occurrence to the last', async () => {
    const wrapper = mountSearch({ activeIndex: 1 })
    await nav(wrapper).vm.$emit('previous')
    expect(wrapper.emitted('update:activeIndex')).toEqual([[3]])
  })

  it('asks to reactivate the single occurrence instead of moving', async () => {
    const wrapper = mountSearch({ activeIndex: 1, occurrences: 1 })
    await nav(wrapper).vm.$emit('next')
    await nav(wrapper).vm.$emit('previous')
    expect(wrapper.emitted('update:activeIndex')).toBeUndefined()
    expect(wrapper.emitted('reactivate')).toHaveLength(2)
  })
})
