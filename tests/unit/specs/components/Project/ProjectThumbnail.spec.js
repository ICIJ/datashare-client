import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'

describe('ProjectThumbnail.vue', () => {
  const { plugins } = CoreSetup.init()

  it('should display a colored thumbnail', () => {
    const project = { name: 'local-datashare' }
    const props = { project }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.classes('project-thumbnail--colorized')).toBeTruthy()
  })

  it('should not display a colored thumbnail', () => {
    const project = { name: 'local-datashare', logoUrl: 'https://icij.org' }
    const props = { project }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.classes('project-thumbnail--colorized')).toBeFalsy()
  })

  it('should display a caption using the name', () => {
    const project = { name: 'local-datashare' }
    const props = { project }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.attributes('data-caption')).toBe('lte')
  })

  it('should display a caption using the label', () => {
    const project = { name: 'local-datashare', label: 'Pandora Papers' }
    const props = { project }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.attributes('data-caption')).toBe('pps')
  })

  it('should display a caption even with short name', () => {
    const project = { name: 'foo' }
    const props = { project }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.attributes('data-caption')).toBe('foo')
  })

  it('should display a caption even with short label', () => {
    const project = { name: 'foo', label: 'bar' }
    const props = { project }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.attributes('data-caption')).toBe('bar')
  })

  it('should display a caption even when no consonant in name', () => {
    const project = { name: 'oui' }
    const props = { project }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.attributes('data-caption')).toBe('oui')
  })

  it('should display a caption even when no consonants in name, with max 3 chars', () => {
    const project = { name: 'euoi' }
    const props = { project }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.attributes('data-caption')).toBe('euo')
  })

  it('should not be checked by default', () => {
    const project = { name: 'foo' }
    const props = { project }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.classes('project-thumbnail--checked')).toBeFalsy()
  })

  it('should not be checked when `checked` prop is set', () => {
    const project = { name: 'foo' }
    const props = { project, checked: true }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.classes('project-thumbnail--checked')).toBeTruthy()
  })

  it('should have a default width of 100%', () => {
    const project = { name: 'foo' }
    const props = { project }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.attributes('style')).toContain('width: 100%')
  })

  it('should use a custom width when `width` is set', () => {
    const project = { name: 'foo' }
    const props = { project, width: '1.5em' }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.attributes('style')).toContain('width: 1.5em')
  })

  it('should hide the caption when `noCaption` is set', () => {
    const project = { name: 'foo' }
    const props = { project, noCaption: true }
    const wrapper = shallowMount(ProjectThumbnail, { global: { plugins }, props })
    expect(wrapper.attributes('data-caption')).toBeUndefined()
  })
})
