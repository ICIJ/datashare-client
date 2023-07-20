import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import WidgetProject from '@/components/widget/WidgetProject'

const { localVue, config, i18n, store } = Core.init(createLocalVue()).useAll()

describe('WidgetProject.vue', () => {
  beforeEach(() => {
    config.set('projects', [
      { name: 'foo', maintainerName: 'ICIJ', sourceUrl: 'https://icij.org', creationDate: '1988-12-23 11:00:00' },
      { name: 'bar', updateDate: '1988-12-23 11:00:00' }
    ])
    store.commit('insights/project', 'foo')
  })

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(WidgetProject, { localVue, i18n, store })
    expect(wrapper).toBeTruthy()
  })

  it('should show the name of the project', () => {
    const wrapper = shallowMount(WidgetProject, { localVue, i18n, store })
    const selector = '.widget__fields__item--name .widget__fields__item__value'
    const value = wrapper.find(selector).text().trim()
    expect(value).toBe('foo')
  })

  it('should show the maintainerName of the project', () => {
    const wrapper = shallowMount(WidgetProject, { localVue, i18n, store })
    const selector = '.widget__fields__item--maintainer-name .widget__fields__item__value'
    const value = wrapper.find(selector).text().trim()
    expect(value).toBe('ICIJ')
  })

  it('should show the sourceUrl of the project without protocol', () => {
    const wrapper = shallowMount(WidgetProject, { localVue, i18n, store })
    const selector = '.widget__fields__item--source-url .widget__fields__item__value'
    const value = wrapper.find(selector).text().trim()
    expect(value).toBe('icij.org')
  })

  it('should show the sourceUrl of the project in a link', () => {
    const wrapper = shallowMount(WidgetProject, { localVue, i18n, store })
    const selector = '.widget__fields__item--source-url .widget__fields__item__value a'
    const href = wrapper.find(selector).attributes('href')
    expect(href).toBe('https://icij.org')
  })

  it('should show a different= project name', () => {
    const wrapper = shallowMount(WidgetProject, { localVue, i18n, store })
    store.commit('insights/project', 'bar')
    const selector = '.widget__fields__item--name .widget__fields__item__value'
    const value = wrapper.find(selector).text().trim()
    expect(value).toBe('foo')
  })
})
