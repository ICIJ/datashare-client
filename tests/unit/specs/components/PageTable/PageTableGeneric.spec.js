import { shallowMount, mount } from '@vue/test-utils'
import { it } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import PageTableTr from '@/components/PageTable/PageTableTr'

describe('PageTableGeneric.vue', () => {
  const slots = {
    'row-details': `
      <template #row-details="{ item }">
        Detail for {{ item.name }}
      </template>
    `
  }

  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
  })

  it('renders correctly', () => {
    const wrapper = shallowMount(PageTableGeneric, { global: { plugins } })
    expect(wrapper.exists()).toBe(true)
  })

  it('shows empty table', () => {
    const wrapper = mount(PageTableGeneric, { global: { plugins } })
    expect(wrapper.find('.page-table-generic__no-result').exists()).toBe(true)
  })

  it('shows table with 2 tasks', () => {
    const props = { items: [{ id: 1 }, { id: 2 }] }
    const wrapper = mount(PageTableGeneric, { props, global: { plugins, renderSlotDefaultStub: true } })
    expect(wrapper.find('.page-table-generic__no-result').exists()).toBe(false)
    expect(wrapper.findAllComponents(PageTableTr)).toHaveLength(2)
  })

  it('shows table with 2 tasks and one column "name"', () => {
    const props = {
      items: [
        { id: 1, name: 'task1' },
        { id: 2, name: 'task2' }
      ],
      fields: [{ value: 'name' }]
    }
    const wrapper = mount(PageTableGeneric, { props, global: { plugins, renderSlotDefaultStub: true } })
    expect(wrapper.find('.page-table-generic__no-result').exists()).toBe(false)
    const rows = wrapper.findAllComponents(PageTableTr)
    expect(rows).toHaveLength(2)
    expect(rows.at(0).text()).toBe('task1')
    expect(rows.at(1).text()).toBe('task2')
  })

  it('shows table with 2 tasks and columns "id" and "name"', () => {
    const props = {
      items: [
        { id: 'id1', name: 'task1' },
        { id: 'id2', name: 'task2' }
      ],
      fields: [{ value: 'id' }, { value: 'name' }]
    }
    const wrapper = mount(PageTableGeneric, { props, global: { plugins, renderSlotDefaultStub: true } })
    const rows = wrapper.findAllComponents(PageTableTr)
    expect(rows.at(0).text()).toContain('id1')
    expect(rows.at(0).text()).toContain('task1')
  })

  it('updates visible columns', async () => {
    const props = {
      items: [{ id: 'id1', name: 'task1' }],
      fields: [{ value: 'id' }]
    }
    const wrapper = mount(PageTableGeneric, { props, global: { plugins, renderSlotDefaultStub: true } })
    const rows = wrapper.findAllComponents(PageTableTr)
    expect(rows.at(0).text()).toContain('id1')
    expect(rows.at(0).text()).not.toContain('task1')
    await wrapper.setProps({
      fields: [{ value: 'id' }, { value: 'name' }]
    })
    const newRows = wrapper.findAllComponents(PageTableTr)
    expect(newRows.at(0).text()).toContain('id1')
    expect(newRows.at(0).text()).toContain('task1')
  })

  it('should show row details for the first item but not the second', () => {
    const props = {
      items: [
        { id: 'id1', name: 'task1', _showDetails: true },
        { id: 'id2', name: 'task2' }
      ],
      fields: [{ value: 'id' }, { value: 'name' }]
    }

    const wrapper = mount(PageTableGeneric, { props, slots, global: { plugins, renderSlotDefaultStub: true } })
    const rowDetails = wrapper.findAll('.page-table-generic__row-details')
    expect(rowDetails.at(0).text().trim()).toBe('Detail for task1')
    expect(rowDetails).toHaveLength(1)
  })

  it('should show row details for the second item but not the first', () => {
    const props = {
      items: [
        { id: 'id1', name: 'task1' },
        { id: 'id2', name: 'task2', _showDetails: true }
      ],
      fields: [{ value: 'id' }, { value: 'name' }]
    }

    const wrapper = mount(PageTableGeneric, { props, slots, global: { plugins, renderSlotDefaultStub: true } })
    const rowDetails = wrapper.findAll('.page-table-generic__row-details')
    expect(rowDetails.at(0).text().trim()).toBe('Detail for task2')
    expect(rowDetails).toHaveLength(1)
  })

  it('should not show any row details', () => {
    const props = {
      items: [
        { id: 'id1', name: 'task1' },
        { id: 'id2', name: 'task2' }
      ],
      fields: [{ value: 'id' }, { value: 'name' }]
    }

    const wrapper = mount(PageTableGeneric, { props, slots, global: { plugins, renderSlotDefaultStub: true } })
    const rowDetails = wrapper.findAll('.page-table-generic__row-details')
    expect(rowDetails).toHaveLength(0)
  })

  it('should show all rows details', () => {
    const props = {
      items: [
        { id: 'id1', name: 'task1' },
        { id: 'id2', name: 'task2' }
      ],
      fields: [{ value: 'id' }, { value: 'name' }],
      showRowDetails: true
    }

    const wrapper = mount(PageTableGeneric, { props, slots, global: { plugins, renderSlotDefaultStub: true } })
    const rowDetails = wrapper.findAll('.page-table-generic__row-details')
    expect(rowDetails).toHaveLength(2)
    expect(rowDetails.at(0).text().trim()).toBe('Detail for task1')
    expect(rowDetails.at(1).text().trim()).toBe('Detail for task2')
  })
})
