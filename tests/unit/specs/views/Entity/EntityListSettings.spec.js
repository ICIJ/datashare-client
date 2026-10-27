import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import CoreSetup from '~tests/unit/CoreSetup'
import EntityListSettings from '@/views/Entity/EntityListSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useAppStore } from '@/store/modules'

const mountSettings = () => {
  const core = CoreSetup.init().useAll().useRouterWithoutGuards()
  return mount(EntityListSettings, { global: { plugins: core.plugins }, props: { visible: true } })
}

const sectionLabels = wrapper =>
  wrapper.findAllComponents(PageSettingsSection).map(s => s.props('label'))

describe('EntityListSettings.vue', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('offers a sort section and a per-page section', () => {
    expect(sectionLabels(mountSettings())).toHaveLength(2)
  })

  it('offers relevance and entity id as the only sort options', () => {
    const [sort] = mountSettings().findAllComponents(PageSettingsSection)
    const keys = [...new Set(sort.props('options').map(({ value: [key] }) => key))]
    expect(keys).toEqual(['_score', 'entityId'])
  })

  // Layout arrives with ICIJ/datashare#2508; the property picker was removed by the decision that
  // a card shows its own schema's featured properties.
  it('offers no layout section and no property picker', () => {
    const labels = sectionLabels(mountSettings()).join(' ').toLowerCase()
    expect(labels).not.toContain('layout')
    expect(labels).not.toContain('propert')
  })

  it('writes the chosen page size into the entityList settings', async () => {
    const wrapper = mountSettings()
    const perPage = wrapper.findAllComponents(PageSettingsSection).at(1)
    await perPage.vm.$emit('update:modelValue', 50)
    expect(useAppStore().getSettings('entityList', 'perPage')).toBe(50)
  })
})
