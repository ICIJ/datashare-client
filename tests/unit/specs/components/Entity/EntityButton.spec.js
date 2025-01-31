import { shallowMount, mount } from '@vue/test-utils'

import EntityButton from '@/components/Entity/EntityButton'
import EntityOccurrences from '@/components/Entity/EntityOccurrences'
import ButtonIcon from '@/components/Button/ButtonIcon'

describe('EntityButton.vue', () => {
  it('should be a Vue instance', async () => {
    const props = { entity: { category: 'PERSON', mention: 'Riri', offsets: ['2', '4'], to: {} } }
    const wrapper = shallowMount(EntityButton, { props })
    expect(wrapper).toBeTruthy()
  })

  it('should display mention text "Riri"', () => {
    const props = { entity: { category: 'PERSON', mention: 'Riri', offsets: ['2', '4'], to: {} } }
    const wrapper = shallowMount(EntityButton, {
      props,
      global: { mocks: { $n: (msg) => msg }, renderStubDefaultSlot: true }
    })
    expect(wrapper.text()).toBe('Riri')
  })

  it('should display show 2 entity occurrences', () => {
    const props = { entity: { category: 'PERSON', mention: 'Riri', offsets: ['2', '4'], to: {} } }
    const wrapper = shallowMount(EntityButton, {
      props,
      global: { mocks: { $n: (msg) => msg }, renderStubDefaultSlot: true }
    })
    expect(wrapper.findComponent(EntityOccurrences).exists()).toBe(true)
    expect(wrapper.findComponent(EntityOccurrences).attributes('occurrences')).toBe('2')
  })
  it('should not display entity occurrences if none', () => {
    const props = { entity: { category: 'PERSON', mention: 'Riri', offsets: [], to: {} } }
    const wrapper = shallowMount(EntityButton, {
      props,
      global: { mocks: { $n: (msg) => msg }, renderStubDefaultSlot: true }
    })
    expect(wrapper.findComponent(EntityOccurrences).exists()).toBe(false)
  })
  it('should use icon and color according to the category', async () => {
    const props = { entity: { category: 'PERSON', mention: 'Riri', offsets: [], to: {} } }
    const wrapper = shallowMount(EntityButton, {
      props,
      global: { mocks: { $n: (msg) => msg }, renderStubDefaultSlot: true }
    })
    expect(wrapper.findComponent(ButtonIcon).exists()).toBe(true)
    expect(wrapper.findComponent(ButtonIcon).attributes('class')).toContain('entity-button--category-person')

    const propsOrga = { entity: { category: 'ORGANIZATION', mention: 'Picsou Org.', offsets: [], to: {} } }
    await wrapper.setProps(propsOrga)
    expect(wrapper.findComponent(ButtonIcon).attributes('class')).toContain('entity-button--category-organization')
    const propsLocation = { entity: { category: 'LOCATION', mention: 'Picsou Org.', offsets: [], to: {} } }
    await wrapper.setProps(propsLocation)
    expect(wrapper.findComponent(ButtonIcon).attributes('class')).toContain('entity-button--category-location')
  })
})
