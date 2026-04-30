import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentUserTags from '@/components/Document/DocumentUser/DocumentUserTags/DocumentUserTags'

describe('DocumentUserTags', () => {
  let plugins

  beforeAll(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  const tags = [
    { label: 'tag1', user: { id: 'user1' } },
    { label: 'tag2', user: { id: 'user1' } }
  ]

  it('should emit delete when a tag is removed via the action input', async () => {
    const wrapper = mount(DocumentUserTags, {
      global: { plugins },
      props: { tags, username: 'user1' }
    })

    const action = wrapper.findComponent({ name: 'DocumentUserTagsAction' })
    await action.vm.$emit('update:modelValue', ['tag2'])

    expect(wrapper.emitted('delete')?.[0]).toEqual(['tag1'])
    expect(wrapper.emitted('add')).toBeFalsy()
  })

  it('should emit add when a new tag is added via the action input', async () => {
    const wrapper = mount(DocumentUserTags, {
      global: { plugins },
      props: { tags, username: 'user1' }
    })

    const action = wrapper.findComponent({ name: 'DocumentUserTagsAction' })
    await action.vm.$emit('update:modelValue', ['tag1', 'tag2', 'tag3'])

    expect(wrapper.emitted('add')?.[0]).toEqual([['tag3']])
    expect(wrapper.emitted('delete')).toBeFalsy()
  })
})
