import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import EntityCardPlaceholder from '@/components/Entity/EntityCard/EntityCardPlaceholder'

const mountPlaceholder = (props) => {
  const core = CoreSetup.init().useAll()
  return mount(EntityCardPlaceholder, { global: { plugins: core.plugins }, props })
}

describe('EntityCardPlaceholder.vue', () => {
  it('renders a row per property', () => {
    const wrapper = mountPlaceholder({ properties: ['name', 'model', 'project'] })
    expect(wrapper.findAll('.entity-card-placeholder').length).toBe(1)
  })

  // `v-for="j in properties.length - 1"` asks Vue for an array of length -1, which is a
  // RangeError rather than an empty render.
  it('renders without throwing when the property list is empty', () => {
    expect(() => mountPlaceholder({ properties: [] })).not.toThrow()
  })

  it('repeats the placeholder card', () => {
    const wrapper = mountPlaceholder({ properties: ['name'], repeat: 3 })
    expect(wrapper.findAll('.entity-card-placeholder').length).toBe(3)
  })
})
