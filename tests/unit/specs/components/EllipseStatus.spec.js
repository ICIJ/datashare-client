import { createLocalVue, shallowMount } from '@vue/test-utils'

import EllipseStatus from '@/components/EllipseStatus'
import { Core } from '@/core'

describe('EllipseStatus.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()

  it('should return 100 as progress number when task succeed', () => {
    const propsData = { status: 'SUCCESS', progress: -1 }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusProgress).toBe(100)
  })

  it('should return 100 as progress number when task is errored', () => {
    const propsData = { status: 'ERROR', progress: -1 }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusProgress).toBe(100)
  })

  it('should return 100 as progress number when task is done', () => {
    const propsData = { status: 'DONE', progress: -1 }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusProgress).toBe(100)
  })

  it('should return 99 as progress number', () => {
    const propsData = { status: 'RUNNING', progress: 99 }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusProgress).toBe(99)
  })

  it('should return 40 as progress number', () => {
    const propsData = { status: 'RUNNING', progress: 40 }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusProgress).toBe(40)
  })

  it('should return 0 as progress number when value is negative', () => {
    const propsData = { status: 'RUNNING', progress: -4 }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusProgress).toBe(0)
  })

  it('should return 100 as progress number when value is abose 100', () => {
    const propsData = { status: 'RUNNING', progress: 104 }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusProgress).toBe(100)
  })

  it('should return 99 as progress rounded number', () => {
    const propsData = { status: 'RUNNING', progress: 98.6 }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusProgress).toBe(99)
  })

  it('should return 99% as progress rounded number', () => {
    const propsData = { status: 'RUNNING', progress: 98.6 }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusProgressAsPercentage).toBe('99%')
  })

  it('should use horizontal layout', () => {
    const propsData = { status: 'RUNNING', horizontal: false }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.classes()).toContain('flex-column')
  })

  it('should use an horizontal layout', () => {
    const propsData = { status: 'RUNNING', horizontal: true }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.classes()).not.toContain('flex-column')
  })

  it('should be in a "loading" state when running without progress', () => {
    const propsData = { status: 'RUNNING' }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.loading).toBeTruthy()
  })

  it('should not be in a "loading" state when running with a progress', () => {
    const propsData = { status: 'RUNNING', progress: 50 }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.loading).toBeFalsy()
  })

  it('should turn the status "RUNNING" into a "info" variant', () => {
    const propsData = { status: 'RUNNING' }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusAsVariant).toBe('info')
  })

  it('should turn the status "running" into a "info" variant', () => {
    const propsData = { status: 'running' }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusAsVariant).toBe('info')
  })

  it('should turn the status "INFO" into a "info" variant', () => {
    const propsData = { status: 'INFO' }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusAsVariant).toBe('info')
  })

  it('should turn the status "QUEUED" into a "info" variant', () => {
    const propsData = { status: 'QUEUED' }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusAsVariant).toBe('info')
  })

  it('should turn the status "pending" into a "info" variant', () => {
    const propsData = { status: 'pending' }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusAsVariant).toBe('info')
  })

  it('should turn the status "DONE" into a "success" variant', () => {
    const propsData = { status: 'DONE' }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusAsVariant).toBe('success')
  })

  it('should turn the status "OK" into a "success" variant', () => {
    const propsData = { status: 'OK' }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusAsVariant).toBe('success')
  })

  it('should turn the status "CANCELLED" into a "warning" variant', () => {
    const propsData = { status: 'CANCELLED' }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusAsVariant).toBe('warning')
  })

  it('should turn the status "ERROR" into a "danger" variant', () => {
    const propsData = { status: 'ERROR' }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusAsVariant).toBe('danger')
  })

  it('should turn the status "FAILED" into a "danger" variant', () => {
    const propsData = { status: 'FAILED' }
    const wrapper = shallowMount(EllipseStatus, { i18n, localVue, propsData })
    expect(wrapper.vm.statusAsVariant).toBe('danger')
  })

  it('should create a unique modal id', () => {
    const first = shallowMount(EllipseStatus, { i18n, localVue })
    const second = shallowMount(EllipseStatus, { i18n, localVue })
    expect(first.vm.errorModalId).not.toEqual(second.vm.errorModalId)
  })
})
