import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplaySnapshotRepositoryType from '@/components/Display/DisplaySnapshotRepositoryType'

describe('DisplaySnapshotRepositoryType', () => {
  function mountComponent(props = {}) {
    const { plugins } = CoreSetup.init().useI18n()

    return shallowMount(DisplaySnapshotRepositoryType, {
      global: { plugins },
      props
    })
  }

  it('should render the component', () => {
    const wrapper = mountComponent({ value: 'fs' })
    expect(wrapper.find('.display-snapshot-repository-type').exists()).toBeTruthy()
  })

  it('should display the icon', () => {
    const wrapper = mountComponent({ value: 'fs' })
    expect(wrapper.find('.display-snapshot-repository-type__icon').exists()).toBeTruthy()
  })

  it('should display the label', () => {
    const wrapper = mountComponent({ value: 'fs' })
    expect(wrapper.find('.display-snapshot-repository-type__label').exists()).toBeTruthy()
  })

  it('should display "file system" for fs type', () => {
    const wrapper = mountComponent({ value: 'fs' })
    expect(wrapper.text()).toContain('file system')
  })

  it('should display "Amazon S3" for s3 type', () => {
    const wrapper = mountComponent({ value: 's3' })
    expect(wrapper.text()).toContain('Amazon S3')
  })

  it('should default to fs type when no value provided', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('file system')
  })
})
