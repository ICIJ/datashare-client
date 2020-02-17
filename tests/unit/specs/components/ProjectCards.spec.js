import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import ProjectCards from '@/components/ProjectCards'
import { Core } from '@/core'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('ProjectCards.vue', () => {
  let wrapper

  it('should display one card for first-index', () => {
    Murmur.config.merge({ datashare_indices: JSON.stringify(['first-index']) })
    wrapper = shallowMount(ProjectCards, { localVue, store })

    expect(wrapper.findAll('.project-cards__item')).toHaveLength(1)
  })

  it('should display one card for with the index name in titlecase', () => {
    Murmur.config.merge({ datashare_indices: JSON.stringify(['first-index']) })
    wrapper = shallowMount(ProjectCards, { localVue, store })

    expect(wrapper.find('.project-cards__item__body').text()).toBe('First Index')
  })

  it('should display two cards', () => {
    Murmur.config.merge({ datashare_indices: JSON.stringify(['first-index', 'second-index']) })
    wrapper = shallowMount(ProjectCards, { localVue, store })

    expect(wrapper.findAll('.project-cards__item')).toHaveLength(2)
  })

  it('should display one active card among the two cards', () => {
    Murmur.config.merge({ datashare_indices: JSON.stringify(['first-index', 'second-index']) })
    store.commit('search/index', 'second-index')
    wrapper = shallowMount(ProjectCards, { localVue, store })

    expect(wrapper.findAll('.project-cards__item--active')).toHaveLength(1)
    expect(wrapper.find('.project-cards__item--active').text()).toBe('Second Index')
  })
})
