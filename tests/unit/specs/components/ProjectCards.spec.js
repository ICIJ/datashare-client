import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import ProjectCards from '@/components/ProjectCards'
import { Core } from '@/core'

const { localVue, store, i18n } = Core.init(createLocalVue()).useAll()

describe('ProjectCards.vue', () => {
  let wrapper

  it('should display one card for first-index', () => {
    Murmur.config.set('projects', [{ name: 'foo' }])
    wrapper = shallowMount(ProjectCards, { localVue, store, i18n })

    expect(wrapper.findAll('.project-cards__item')).toHaveLength(1)
  })

  it('should display one card for with the index name in titlecase', () => {
    Murmur.config.set('projects', [{ name: 'first-index', label: 'First Index' }])
    wrapper = shallowMount(ProjectCards, { localVue, store, i18n })

    expect(wrapper.find('.project-cards__item__heading').text()).toBe('First Index')
  })

  it('should display two cards', () => {
    Murmur.config.set('projects', [{ name: 'first-index' }, { name: 'second-index' }])
    wrapper = shallowMount(ProjectCards, { localVue, store, i18n })

    expect(wrapper.findAll('.project-cards__item')).toHaveLength(2)
  })

  it('should display one active card among the two cards', () => {
    Murmur.config.set('projects', [{ name: 'first-index' }, { name: 'second-index', label: 'Second Index' }])
    store.commit('search/index', 'second-index')
    wrapper = shallowMount(ProjectCards, { localVue, store, i18n })

    expect(wrapper.findAll('.project-cards__item--active')).toHaveLength(1)
    expect(wrapper.find('.project-cards__item--active .project-cards__item__heading').text().trim()).toBe(
      'Second Index'
    )
  })
})
