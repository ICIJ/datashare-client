import { mount } from '@vue/test-utils'
import { ref, defineComponent } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSelectedProjects } from '@/composables/useSelectedProjects'

// A host component is required because useSelectedProjects relies on useCore,
// which needs an active component instance.
function withComposable(modelValueInit, options = {}) {
  let api
  const Host = defineComponent({
    setup() {
      const modelValue = ref(modelValueInit)
      api = { modelValue, ...useSelectedProjects(modelValue, options) }
      return () => null
    }
  })
  const { plugins, config } = CoreSetup.init().useAll().useRouterWithoutGuards()
  config.set('defaultProject', 'default-project')
  config.set('projects', [{ name: 'default-project' }, { name: 'banana-papers' }])
  mount(Host, { global: { plugins } })
  return api
}

describe('useSelectedProjects', () => {
  it('resolves an existing single project', () => {
    const { selectedProjects } = withComposable({ name: 'banana-papers' })
    expect(selectedProjects.value.name).toBe('banana-papers')
  })

  it('returns null for an unknown single project without fallback', () => {
    const { selectedProjects } = withComposable({ name: 'kiwi-papers' })
    expect(selectedProjects.value).toBeNull()
  })

  it('falls back to the default project when enabled', () => {
    const { selectedProjects } = withComposable({ name: 'kiwi-papers' }, { fallbackDefault: true })
    expect(selectedProjects.value.name).toBe('default-project')
  })

  it('filters an array to existing projects only', () => {
    const { selectedProjects } = withComposable([{ name: 'banana-papers' }, { name: 'kiwi-papers' }])
    expect(selectedProjects.value.map(p => p.name)).toEqual(['banana-papers'])
  })
})
