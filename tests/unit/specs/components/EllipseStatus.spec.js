import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import EllipseStatus from '@/components/EllipseStatus'

describe('EllipseStatus.vue', () => {
  const { plugins } = CoreSetup.init().useAll()

  it('should return 100 as progress number when task succeed', () => {
    const props = { status: 'SUCCESS', progress: -1 }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusProgress).toBe(100)
  })

  it('should return 100 as progress number when task is errored', () => {
    const props = { status: 'ERROR', progress: -1 }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusProgress).toBe(100)
  })

  it('should return 100 as progress number when task is done', () => {
    const props = { status: 'DONE', progress: -1 }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusProgress).toBe(100)
  })

  it('should return 99 as progress number', () => {
    const props = { status: 'RUNNING', progress: 99 }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusProgress).toBe(99)
  })

  it('should return 40 as progress number', () => {
    const props = { status: 'RUNNING', progress: 40 }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusProgress).toBe(40)
  })

  it('should return 0 as progress number when value is negative', () => {
    const props = { status: 'RUNNING', progress: -4 }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusProgress).toBe(0)
  })

  it('should return 100 as progress number when value is above 100', () => {
    const props = { status: 'RUNNING', progress: 104 }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusProgress).toBe(100)
  })

  it('should return 99 as progress rounded number', () => {
    const props = { status: 'RUNNING', progress: 98.6 }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusProgress).toBe(99)
  })

  it('should return 99% as progress rounded number', () => {
    const props = { status: 'RUNNING', progress: 98.6 }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusProgressAsPercentage).toBe('99%')
  })

  it('should use horizontal layout', () => {
    const props = { status: 'RUNNING', horizontal: false }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.classes()).toContain('flex-column')
  })

  it('should use an horizontal layout', () => {
    const props = { status: 'RUNNING', horizontal: true }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.classes()).not.toContain('flex-column')
  })

  it('should be in a "loading" state when running without progress', () => {
    const props = { status: 'RUNNING' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.loading).toBeTruthy()
  })

  it('should not be in a "loading" state when running with a progress', () => {
    const props = { status: 'RUNNING', progress: 50 }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.loading).toBeFalsy()
  })

  it('should turn the status "RUNNING" into a "info" variant', () => {
    const props = { status: 'RUNNING' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusAsVariant).toBe('info')
  })

  it('should turn the status "CREATED" into a "info" variant', () => {
    const props = { status: 'CREATED' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusAsVariant).toBe('info')
  })

  it('should turn the status "running" into a "info" variant', () => {
    const props = { status: 'running' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusAsVariant).toBe('info')
  })

  it('should turn the status "INFO" into a "info" variant', () => {
    const props = { status: 'INFO' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusAsVariant).toBe('info')
  })

  it('should turn the status "QUEUED" into a "info" variant', () => {
    const props = { status: 'QUEUED' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusAsVariant).toBe('info')
  })

  it('should turn the status "pending" into a "info" variant', () => {
    const props = { status: 'pending' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusAsVariant).toBe('info')
  })

  it('should turn the status "DONE" into a "success" variant', () => {
    const props = { status: 'DONE' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusAsVariant).toBe('success')
  })

  it('should turn the status "OK" into a "success" variant', () => {
    const props = { status: 'OK' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusAsVariant).toBe('success')
  })

  it('should turn the status "CANCELLED" into a "warning" variant', () => {
    const props = { status: 'CANCELLED' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusAsVariant).toBe('warning')
  })

  it('should turn the status "ERROR" into a "danger" variant', () => {
    const props = { status: 'ERROR' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusAsVariant).toBe('danger')
  })

  it('should turn the status "FAILED" into a "danger" variant', () => {
    const props = { status: 'FAILED' }
    const wrapper = shallowMount(EllipseStatus, { plugins, props })
    expect(wrapper.vm.statusAsVariant).toBe('danger')
  })

  it('should create a unique modal id', () => {
    const first = shallowMount(EllipseStatus, { plugins })
    const second = shallowMount(EllipseStatus, { plugins })
    expect(first.vm.errorModalId).not.toEqual(second.vm.errorModalId)
  })
})
