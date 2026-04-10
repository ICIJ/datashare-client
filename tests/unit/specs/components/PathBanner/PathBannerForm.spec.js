import { shallowMount } from '@vue/test-utils'

import { ButtonIcon } from '@icij/murmur-next'

import CoreSetup from '~tests/unit/CoreSetup'
import PathBannerForm from '@/components/PathBanner/PathBannerForm.vue'

describe('PathBannerForm.vue', () => {
  let global

  const newBanner = Object.freeze({
    blurSensitiveMedia: false,
    note: '',
    variant: 'info',
    path: null
  })

  const existingBanner = Object.freeze({
    blurSensitiveMedia: false,
    note: 'Existing banner text',
    variant: 'warning',
    path: '/data'
  })

  const sensitiveBanner = Object.freeze({
    ...existingBanner,
    blurSensitiveMedia: true
  })

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  function shallowMountComponent(props = {}) {
    return shallowMount(PathBannerForm, {
      global,
      props: { banner: newBanner, ...props }
    })
  }

  it('emits "save" with form data when submit() is called', async () => {
    const wrapper = shallowMountComponent({ banner: existingBanner })
    wrapper.vm.submit()
    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')[0][0]).toMatchObject({ note: 'Existing banner text' })
  })

  it('resets local form when the banner prop changes', async () => {
    const wrapper = shallowMountComponent({ banner: newBanner })
    await wrapper.setProps({ banner: existingBanner })
    wrapper.vm.submit()
    expect(wrapper.emitted('save')[0][0]).toMatchObject({ note: 'Existing banner text' })
  })

  it('renders PathBannerPreview', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.findComponent({ name: 'PathBannerPreview' }).exists()).toBe(true)
  })

  it('isValid is false when path is null', () => {
    const wrapper = shallowMountComponent({ banner: newBanner })
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid is false when note is empty', () => {
    const wrapper = shallowMountComponent({ banner: { ...existingBanner, note: '' } })
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid is true when path and note are set', () => {
    const wrapper = shallowMountComponent({ banner: existingBanner })
    expect(wrapper.vm.isValid).toBe(true)
  })

  describe('reset()', () => {
    it('restores all fields to the original banner prop values', () => {
      const wrapper = shallowMountComponent({ banner: existingBanner })
      // Mutate the form
      wrapper.vm.form.note = 'changed note'
      wrapper.vm.form.variant = 'danger'
      wrapper.vm.reset()
      wrapper.vm.submit()
      expect(wrapper.emitted('save')[0][0]).toMatchObject({
        note: existingBanner.note,
        variant: existingBanner.variant,
        path: existingBanner.path,
        blurSensitiveMedia: existingBanner.blurSensitiveMedia
      })
    })

    it('resets to empty defaults for a new banner', () => {
      const wrapper = shallowMountComponent({ banner: newBanner })
      wrapper.vm.form.note = 'typed something'
      wrapper.vm.reset()
      wrapper.vm.submit()
      expect(wrapper.emitted('save')[0][0]).toMatchObject({ note: '', variant: 'info', path: null })
    })
  })

  describe('"Use default text" button', () => {
    it('is not rendered when blurSensitiveMedia is false', () => {
      const wrapper = shallowMountComponent({ banner: existingBanner })
      expect(wrapper.findComponent(ButtonIcon).exists()).toBe(false)
    })

    it('is rendered when blurSensitiveMedia is true', () => {
      const wrapper = shallowMountComponent({ banner: sensitiveBanner })
      expect(wrapper.findComponent(ButtonIcon).exists()).toBe(true)
    })

    it('sets note to the default sensitive content text when clicked', async () => {
      const wrapper = shallowMountComponent({ banner: { ...sensitiveBanner, note: '' } })
      await wrapper.findComponent(ButtonIcon).trigger('click')
      wrapper.vm.submit()
      expect(wrapper.emitted('save')[0][0].note).toBe(
        'This media may contain sensitive content that some people may find disturbing or offensive.'
      )
    })
  })

  describe('variant and sensitive content fields', () => {
    it('always renders the VariantDropdown', () => {
      const wrapper = shallowMountComponent({ banner: existingBanner })
      expect(wrapper.findComponent({ name: 'VariantDropdown' }).exists()).toBe(true)
    })

    it('renders the VariantDropdown even when blurSensitiveMedia is true', () => {
      const wrapper = shallowMountComponent({ banner: sensitiveBanner })
      expect(wrapper.findComponent({ name: 'VariantDropdown' }).exists()).toBe(true)
    })

    it('binds the current variant to VariantDropdown', () => {
      const wrapper = shallowMountComponent({ banner: existingBanner })
      const dropdown = wrapper.findComponent({ name: 'VariantDropdown' })
      expect(dropdown.props('modelValue')).toBe('warning')
    })

    it('renders the blurSensitiveMedia radio group', () => {
      const wrapper = shallowMountComponent({ banner: existingBanner })
      expect(wrapper.findAllComponents({ name: 'BFormRadioGroup' })).toHaveLength(1)
    })
  })
})
