import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import WidgetBarometerDocuments from '@/components/Widget/WidgetBarometerDocuments'

describe('WidgetBarometerDocuments.vue', () => {
  let core

  const mountWidget = (props = {}) =>
    mount(WidgetBarometerDocuments, {
      global: { plugins: core.plugins },
      props
    })

  const tooltip = wrapper => wrapper.find('.widget-barometer-documents__duplicates')
  // The `v-b-tooltip` directive relocates the `title` attribute to
  // `data-original-title` once mounted, so read the resolved title from there.
  const tooltipTitle = wrapper => tooltip(wrapper).attributes('data-original-title')

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('renders the duplicates info icon when nbDuplicates is a number', () => {
    const wrapper = mountWidget({ nbDocuments: 10, nbDocumentsOnDisks: 10, nbDuplicates: 5 })
    expect(tooltip(wrapper).exists()).toBe(true)
  })

  it('hides the duplicates info icon when nbDuplicates is null', () => {
    const wrapper = mountWidget({ nbDocuments: 10, nbDocumentsOnDisks: 10, nbDuplicates: null })
    expect(tooltip(wrapper).exists()).toBe(false)
  })

  it('shows the "no duplicates" tooltip when nbDuplicates is 0', () => {
    const wrapper = mountWidget({ nbDocuments: 10, nbDocumentsOnDisks: 10, nbDuplicates: 0 })
    expect(tooltipTitle(wrapper)).toBe('No duplicates were detected during indexation')
  })

  it('shows the singular tooltip when nbDuplicates is 1', () => {
    const wrapper = mountWidget({ nbDocuments: 10, nbDocumentsOnDisks: 10, nbDuplicates: 1 })
    expect(tooltipTitle(wrapper)).toBe('1 duplicate ignored during indexation')
  })

  it('shows a human-formatted plural tooltip for large counts', () => {
    const wrapper = mountWidget({ nbDocuments: 10, nbDocumentsOnDisks: 10, nbDuplicates: 8000 })
    expect(tooltipTitle(wrapper)).toBe('8K duplicates ignored during indexation')
  })
})
