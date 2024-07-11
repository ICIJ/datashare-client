import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import WidgetProject from '@/components/Widget/WidgetProject'

describe('WidgetProject.vue', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    core.store.commit('insights/project', 'foo')
    core.config.set('projects', [
      { name: 'foo', maintainerName: 'ICIJ', sourceUrl: 'https://icij.org', creationDate: '1988-12-23 11:00:00' },
      { name: 'bar', updateDate: '1988-12-23 11:00:00' }
    ])
    plugins = core.plugins
  })

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(WidgetProject, { global: { plugins } })
    expect(wrapper).toBeTruthy()
  })

  it('should show the name of the project', () => {
    const wrapper = shallowMount(WidgetProject, { global: { plugins } })
    const selector = '.widget__fields__item--name .widget__fields__item__value'
    const value = wrapper.find(selector).text().trim()
    expect(value).toBe('foo')
  })

  it('should show the maintainerName of the project', () => {
    const wrapper = shallowMount(WidgetProject, { global: { plugins } })
    const selector = '.widget__fields__item--maintainer-name .widget__fields__item__value'
    const value = wrapper.find(selector).text().trim()
    expect(value).toBe('ICIJ')
  })

  it('should show the sourceUrl of the project without protocol', () => {
    const wrapper = shallowMount(WidgetProject, { global: { plugins } })
    const selector = '.widget__fields__item--source-url .widget__fields__item__value'
    const value = wrapper.find(selector).text().trim()
    expect(value).toBe('icij.org')
  })

  it('should show the sourceUrl of the project in a link', () => {
    const wrapper = shallowMount(WidgetProject, { global: { plugins } })
    const selector = '.widget__fields__item--source-url .widget__fields__item__value a'
    const href = wrapper.find(selector).attributes('href')
    expect(href).toBe('https://icij.org')
  })

  it('should show a different= project name', () => {
    const wrapper = shallowMount(WidgetProject, { global: { plugins } })
    wrapper.vm.$store.commit('insights/project', 'bar')
    const selector = '.widget__fields__item--name .widget__fields__item__value'
    const value = wrapper.find(selector).text().trim()
    expect(value).toBe('foo')
  })
})
