import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchBreadcrumbFormEntry from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormEntry'
import SearchBreadcrumbFormList from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormList'

describe('SearchBreadcrumbFormList.vue', () => {
  let global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
  })

  // Helper that picks the assembled entry chips and reports the operator
  // forwarded to the chip — keeps the assertions readable across cases
  function readEntryFlags(wrapper) {
    return wrapper.findAllComponents(SearchBreadcrumbFormEntry).map(entry => ({
      filter: entry.props('filter'),
      value: entry.props('value'),
      operator: entry.props('operator')
    }))
  }

  function findOrBadges(wrapper) {
    return wrapper.findAll('.search-parameter-query-term__operator').filter(node => node.text() === 'OR')
  }

  describe('when both sides of a paired pair are active', () => {
    it('renders one OR badge inside the partner chip', () => {
      const props = {
        entries: [
          { filter: 'contentType', value: 'application/pdf' },
          { filter: 'contentTypeCategory', value: 'AUDIO' }
        ]
      }
      const wrapper = mount(SearchBreadcrumbFormList, { global, props })

      expect(findOrBadges(wrapper)).toHaveLength(1)

      const flags = readEntryFlags(wrapper)
      expect(flags).toHaveLength(2)
      expect(flags[0].operator).toBeNull()
      expect(flags[1].operator).toBe('OR')
    })

    it('renders the OR badge regardless of which side appears first in the input', () => {
      const props = {
        entries: [
          { filter: 'contentTypeCategory', value: 'AUDIO' },
          { filter: 'contentType', value: 'application/pdf' }
        ]
      }
      const wrapper = mount(SearchBreadcrumbFormList, { global, props })

      expect(findOrBadges(wrapper)).toHaveLength(1)

      const flags = readEntryFlags(wrapper)
      expect(flags[0].operator).toBeNull()
      expect(flags[1].operator).toBe('OR')
    })
  })

  describe('when only one side of a paired pair is active', () => {
    it('renders no OR badge when only contentType is present', () => {
      const props = {
        entries: [{ filter: 'contentType', value: 'application/pdf' }]
      }
      const wrapper = mount(SearchBreadcrumbFormList, { global, props })

      expect(findOrBadges(wrapper)).toHaveLength(0)

      const flags = readEntryFlags(wrapper)
      expect(flags).toHaveLength(1)
      expect(flags[0].operator).toBeNull()
    })

    it('renders no OR badge when only contentTypeCategory is present', () => {
      const props = {
        entries: [{ filter: 'contentTypeCategory', value: 'AUDIO' }]
      }
      const wrapper = mount(SearchBreadcrumbFormList, { global, props })

      expect(findOrBadges(wrapper)).toHaveLength(0)

      const flags = readEntryFlags(wrapper)
      expect(flags[0].operator).toBeNull()
    })
  })

  describe('when paired entries are separated by an unrelated chip', () => {
    it('reorders the paired chips to be adjacent so the OR badge still renders', () => {
      const props = {
        entries: [
          { filter: 'contentType', value: 'application/pdf' },
          { filter: 'language', value: 'ENGLISH' },
          { filter: 'contentTypeCategory', value: 'AUDIO' }
        ]
      }
      const wrapper = mount(SearchBreadcrumbFormList, { global, props })

      expect(findOrBadges(wrapper)).toHaveLength(1)

      const flags = readEntryFlags(wrapper)
      expect(flags).toHaveLength(3)
      expect(flags[0].filter).toBe('contentType')
      expect(flags[0].operator).toBeNull()
      expect(flags[1].filter).toBe('contentTypeCategory')
      expect(flags[1].operator).toBe('OR')
      expect(flags[2].filter).toBe('language')
      expect(flags[2].operator).toBeNull()
    })
  })

  describe('when multiple canonical chips share a single partner', () => {
    it('groups every canonical chip first, then the partner with the OR badge last', () => {
      const props = {
        entries: [
          { filter: 'contentType', value: 'application/msword' },
          { filter: 'contentTypeCategory', value: 'IMAGE' },
          { filter: 'contentType', value: 'application/rtf' },
          { filter: 'contentType', value: 'application/vnd.openxmlformats' }
        ]
      }
      const wrapper = mount(SearchBreadcrumbFormList, { global, props })

      expect(findOrBadges(wrapper)).toHaveLength(1)

      const flags = readEntryFlags(wrapper)
      expect(flags).toHaveLength(4)
      expect(flags[0]).toMatchObject({ filter: 'contentType', value: 'application/msword', operator: null })
      expect(flags[1]).toMatchObject({ filter: 'contentType', value: 'application/rtf', operator: null })
      expect(flags[2]).toMatchObject({ filter: 'contentType', value: 'application/vnd.openxmlformats', operator: null })
      expect(flags[3]).toMatchObject({ filter: 'contentTypeCategory', value: 'IMAGE', operator: 'OR' })
    })
  })

  describe('when one side of a pair is excluded', () => {
    it('renders no OR badge when contentType is excluded but contentTypeCategory is included', () => {
      const props = {
        entries: [
          { filter: '-contentType', value: 'application/pdf' },
          { filter: 'contentTypeCategory', value: 'AUDIO' }
        ]
      }
      const wrapper = mount(SearchBreadcrumbFormList, { global, props })

      expect(findOrBadges(wrapper)).toHaveLength(0)

      const flags = readEntryFlags(wrapper)
      expect(flags).toHaveLength(2)
      expect(flags.every(flag => flag.operator === null)).toBe(true)
    })

    it('renders no OR badge when contentTypeCategory is excluded but contentType is included', () => {
      const props = {
        entries: [
          { filter: 'contentType', value: 'application/pdf' },
          { filter: '-contentTypeCategory', value: 'AUDIO' }
        ]
      }
      const wrapper = mount(SearchBreadcrumbFormList, { global, props })

      expect(findOrBadges(wrapper)).toHaveLength(0)

      const flags = readEntryFlags(wrapper)
      expect(flags.every(flag => flag.operator === null)).toBe(true)
    })
  })

  describe('default-slot fallback', () => {
    it('renders slot content when no entries prop is provided', () => {
      const wrapper = mount(SearchBreadcrumbFormList, {
        global,
        slots: {
          default: '<span class="custom-slot">slotted</span>'
        }
      })

      expect(wrapper.find('.custom-slot').exists()).toBe(true)
      expect(wrapper.findAllComponents(SearchBreadcrumbFormEntry)).toHaveLength(0)
    })
  })

  describe('click:entry-x event', () => {
    it('emits click:entry-x with the originating event and entry payload', async () => {
      const entry = { filter: 'contentType', value: 'application/pdf' }
      const wrapper = mount(SearchBreadcrumbFormList, { global, props: { entries: [entry] } })

      await wrapper.findComponent(SearchBreadcrumbFormEntry).vm.$emit('click:x', 'event-payload')

      expect(wrapper.emitted('click:entry-x')).toBeTruthy()
      expect(wrapper.emitted('click:entry-x')[0]).toEqual(['event-payload', entry])
    })
  })
})
