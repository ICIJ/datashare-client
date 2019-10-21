import ProjectCards from '@/components/ProjectCards'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { App } from '@/main'

const { localVue, store, router } = App.init(createLocalVue()).useAll()

describe('ProjectCards.vue', () => {
  it('should display one card for first-index', async () => {
    Murmur.config.merge({ userProjects: ['first-index'] })
    const wrapper = shallowMount(ProjectCards, { localVue, router, store })
    expect(wrapper.findAll('.project-cards__item')).toHaveLength(1)
  })

  it('should display one card for with the index name in titlecase', async () => {
    Murmur.config.merge({ userProjects: ['first-index'] })
    const wrapper = shallowMount(ProjectCards, { localVue, router, store })
    expect(wrapper.find('.project-cards__item__body').text()).toEqual('First Index')
  })

  it('should display two cards', async () => {
    Murmur.config.merge({ userProjects: ['first-index', 'second-index'] })
    const wrapper = shallowMount(ProjectCards, { localVue, router, store })
    expect(wrapper.findAll('.project-cards__item')).toHaveLength(2)
  })

  it('should display one active card among the two cards', async () => {
    Murmur.config.merge({ userProjects: ['first-index', 'second-index'] })
    store.commit('search/index', 'second-index')
    const wrapper = shallowMount(ProjectCards, { localVue, router, store })
    expect(wrapper.findAll('.project-cards__item--active')).toHaveLength(1)
    expect(wrapper.find('.project-cards__item--active').text()).toBe('Second Index')
  })
})
