import { mount, shallowMount } from '@vue/test-utils'
import { PaginationTiny } from '@icij/murmur'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'
import Hook from '@/components/Hook/Hook'

describe('DocumentToolbox.vue', () => {
  const document = { index: 'foo', id: 'doc-id', routing: 'root-id', source: { metadata: {} }, tags: [] }

  function mountToolbox(props = {}, options = {}) {
    const { plugins } = CoreSetup.init().useAll()
    return shallowMount(DocumentToolbox, {
      props: { document, ...props },
      global: { plugins, renderStubDefaultSlot: true },
      ...options
    })
  }

  it('renders the local search field', () => {
    const wrapper = mountToolbox()
    expect(wrapper.findComponent(DocumentLocalSearch).exists()).toBe(true)
  })

  it('passes the occurrences and the loading flag to the local search field', () => {
    const wrapper = mountToolbox({ occurrences: 3, loading: true })
    expect(wrapper.findComponent(DocumentLocalSearch).props('occurrences')).toBe(3)
    expect(wrapper.findComponent(DocumentLocalSearch).props('loading')).toBe(true)
  })

  it('renders the paginator with the total number of pages', () => {
    const wrapper = mountToolbox({ totalPages: 4 })
    expect(wrapper.findComponent(PaginationTiny).props('totalRows')).toBe(4)
  })

  it('hides the paginator below two pages', () => {
    const wrapper = mountToolbox({ totalPages: 1 })
    expect(wrapper.findComponent(PaginationTiny).exists()).toBe(false)
  })

  it('renders the dropdown slot', () => {
    const slots = { dropdown: '<span class="my-dropdown" />' }
    const wrapper = mountToolbox({}, { slots })
    expect(wrapper.find('.my-dropdown').exists()).toBe(true)
  })

  it('renders no hook when no prefix is given', () => {
    const wrapper = mountToolbox()
    expect(wrapper.findAllComponents(Hook)).toHaveLength(0)
  })

  it('renders every hook position under the given prefix, in order', () => {
    const wrapper = mountToolbox({ hookPrefix: 'document.content', totalPages: 4 })
    const names = wrapper.findAllComponents(Hook).map(hook => hook.props('name'))
    expect(names).toEqual([
      'document.content.toolbox:before',
      'document.content.toolbox.local-search:before',
      'document.content.toolbox.local-search:after',
      'document.content.toolbox.before:before',
      'document.content.toolbox.pagination:after',
      'document.content.toolbox:after'
    ])
  })

  it('keeps the hook positions when the paginator is hidden', () => {
    const wrapper = mountToolbox({ hookPrefix: 'document.content', totalPages: 1 })
    const names = wrapper.findAllComponents(Hook).map(hook => hook.props('name'))
    expect(names).toContain('document.content.toolbox.before:before')
    expect(names).toContain('document.content.toolbox.pagination:after')
  })

  it('updates the search model when a global search term is selected', async () => {
    const wrapper = mountToolbox()
    await wrapper.findComponent({ name: 'DocumentGlobalSearchTerms' }).vm.$emit('select', 'needle')
    expect(wrapper.emitted('update:modelValue')).toEqual([['needle']])
  })

  it('disables the paginator and the dropdown but not the search field', () => {
    const slots = { dropdown: '<span class="my-dropdown" />' }
    const wrapper = mountToolbox({ disabled: true, totalPages: 4 }, { slots })
    const fieldset = wrapper.find('fieldset')
    expect(fieldset.attributes('disabled')).toBeDefined()
    expect(fieldset.findComponent(PaginationTiny).exists()).toBe(true)
    expect(fieldset.find('.my-dropdown').exists()).toBe(true)
    expect(fieldset.findComponent(DocumentLocalSearch).exists()).toBe(false)
  })

  it('exposes the measured height of its root element', () => {
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = mount(DocumentToolbox, {
      props: { document },
      global: { plugins, renderStubDefaultSlot: true }
    })
    expect(typeof wrapper.vm.height).toBe('number')
  })
})
