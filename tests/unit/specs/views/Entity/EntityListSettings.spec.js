import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import CoreSetup from '~tests/unit/CoreSetup'
import EntityListSettings from '@/views/Entity/EntityListSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useAppStore } from '@/store/modules'

const mountSettings = () => {
  const core = CoreSetup.init().useAll().useRouterWithoutGuards()
  return mount(EntityListSettings, { global: { plugins: core.plugins }, props: { visible: true } })
}

// useUrlParam batches query updates behind a 50ms debounce (src/composables/useUrlParam.js:41),
// so a push queued by a settings change has not landed yet when the emit resolves.
const settleUrl = async () => {
  await new Promise(resolve => setTimeout(resolve, 80))
  await flushPromises()
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

  // On page 3 of 25, switching to 100 per page would otherwise leave the offset at 50: the list
  // starts mid-results while the pagination control reads page 1. Every sibling settings panel
  // resets the page for the same reason.
  it('returns to the first page when the page size changes', async () => {
    const wrapper = mountSettings()
    await wrapper.vm.$router.push({ name: 'entity.list', query: { page: '3' } })
    const perPage = wrapper.findAllComponents(PageSettingsSection).at(1)
    await perPage.vm.$emit('update:modelValue', 100)
    await settleUrl()
    expect(Number(wrapper.vm.$route.query.page ?? 1)).toBe(1)
  })

  it('returns to the first page when the sort changes', async () => {
    const wrapper = mountSettings()
    await wrapper.vm.$router.push({ name: 'entity.list', query: { page: '3' } })
    const [sort] = wrapper.findAllComponents(PageSettingsSection)
    await sort.vm.$emit('update:modelValue', ['entityId', 'asc'])
    await settleUrl()
    expect(Number(wrapper.vm.$route.query.page ?? 1)).toBe(1)
  })

  it('writes the chosen page size into the entityList settings', async () => {
    const wrapper = mountSettings()
    const perPage = wrapper.findAllComponents(PageSettingsSection).at(1)
    await perPage.vm.$emit('update:modelValue', 50)
    expect(useAppStore().getSettings('entityList', 'perPage')).toBe(50)
  })
})
