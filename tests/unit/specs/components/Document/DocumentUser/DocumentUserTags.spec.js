import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentUserTags from '@/components/Document/DocumentUser/DocumentUserTags/DocumentUserTags'

describe('DocumentUserTags', () => {
  let plugins

  beforeEach(() => {
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

  it('should not emit delete for a tag owned by another user', async () => {
    const mixedTags = [
      { label: 'my-tag', user: { id: 'user1' } },
      { label: 'other-tag', user: { id: 'user2' } }
    ]
    const wrapper = mount(DocumentUserTags, {
      global: { plugins },
      props: { tags: mixedTags, username: 'user1' }
    })

    const action = wrapper.findComponent({ name: 'DocumentUserTagsAction' })
    // Model value only reflects user1's tags; clicking away from my-tag removes it,
    // but other-tag was never in the model so it should not be deleted.
    await action.vm.$emit('update:modelValue', [])

    expect(wrapper.emitted('delete')).toEqual([['my-tag']])
    expect(wrapper.emitted('delete')?.flat()).not.toContain('other-tag')
  })
})
