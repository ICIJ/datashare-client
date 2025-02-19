import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import WidgetProject from '@/components/Widget/WidgetProject'

describe('WidgetProject.vue', () => {
  const foo = {
    name: 'foo',
    maintainerName: 'ICIJ',
    sourceUrl: 'https://icij.org',
    creationDate: '1988-12-23 11:00:00'
  }
  const bar = { name: 'bar', updateDate: '1988-12-23 11:00:00' }
  const projects = [foo, bar]

  let wrapper

  beforeEach(() => {
    const { config, plugins } = CoreSetup.init().useAll()
    const props = { project: foo.name }
    config.set('projects', projects)
    wrapper = shallowMount(WidgetProject, { global: { plugins }, props })
  })

  it('should be a Vue instance', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should show the name of the project', () => {
    const selector = '.widget__fields__item--name .widget__fields__item__value'
    const value = wrapper.find(selector).text().trim()
    expect(value).toBe(foo.name)
  })

  it('should show the maintainerName of the project', () => {
    const selector = '.widget__fields__item--maintainer-name .widget__fields__item__value'
    const value = wrapper.find(selector).text().trim()
    expect(value).toBe('ICIJ')
  })

  it('should show the sourceUrl of the project without protocol', () => {
    const selector = '.widget__fields__item--source-url .widget__fields__item__value'
    const value = wrapper.find(selector).text().trim()
    expect(value).toBe('icij.org')
  })

  it('should show the sourceUrl of the project in a link', () => {
    const selector = '.widget__fields__item--source-url .widget__fields__item__value a'
    const href = wrapper.find(selector).attributes('href')
    expect(href).toBe('https://icij.org')
  })
})
