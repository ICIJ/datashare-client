import ProjectCards from '@/components/ProjectCards'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur'
import router from '@/router'

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

const localVue = createLocalVue()
localVue.use(Murmur)

describe('ProjectCards.vue', () => {
  it('should display one card for first-index', async () => {
    Murmur.config.merge({ userIndices: ['first-index'] })
    const wrapper = shallowMount(ProjectCards, { localVue, router })
    expect(wrapper.findAll('.project-cards__item')).toHaveLength(1)
  })

  it('should display one card for with the index name in titlecase', async () => {
    Murmur.config.merge({ userIndices: ['first-index'] })
    const wrapper = shallowMount(ProjectCards, { localVue, router })
    expect(wrapper.find('.project-cards__item__body').text()).toEqual('First Index')
  })

  it('should display two cards', async () => {
    Murmur.config.merge({ userIndices: ['first-index', 'second-index'] })
    const wrapper = shallowMount(ProjectCards, { localVue, router })
    expect(wrapper.findAll('.project-cards__item')).toHaveLength(2)
  })
})
