import { shallowMount } from '@vue/test-utils'
import { set } from 'lodash'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectCards from '@/components/ProjectCards'

describe('ProjectCards.vue', () => {
  const nbDocByProject = set({}, 'aggregations.index.buckets', [
    { key: 'first-index', doc_count: 10 },
    { key: 'foo', doc_count: 10 }
  ])

  const api = {
    elasticsearch: { countByProject: vi.fn().mockResolvedValue(nbDocByProject) }
  }

  const { config, plugins, store } = CoreSetup.init(api).useAll()

  it('should display one card for first-index', () => {
    config.set('projects', [{ name: 'foo' }])
    const wrapper = shallowMount(ProjectCards, { global: { plugins } })

    expect(wrapper.findAll('.project-cards__item')).toHaveLength(1)
  })

  it('should display one card for with the index name in titlecase', () => {
    config.set('projects', [{ name: 'first-index', label: 'First Index' }])
    const wrapper = shallowMount(ProjectCards, { global: { plugins } })

    expect(wrapper.find('.project-cards__item__heading').text()).toBe('First Index')
  })

  it('should display two cards', () => {
    config.set('projects', [{ name: 'first-index' }, { name: 'second-index' }])
    const wrapper = shallowMount(ProjectCards, { global: { plugins } })

    expect(wrapper.findAll('.project-cards__item')).toHaveLength(2)
  })

  it('should display one active card among the two cards', () => {
    config.set('projects', [{ name: 'first-index' }, { name: 'second-index', label: 'Second Index' }])
    store.commit('search/index', 'second-index')
    const wrapper = shallowMount(ProjectCards, { global: { plugins } })

    expect(wrapper.findAll('.project-cards__item--active')).toHaveLength(1)
    expect(wrapper.find('.project-cards__item--active .project-cards__item__heading').text().trim()).toBe(
      'Second Index'
    )
  })
})
