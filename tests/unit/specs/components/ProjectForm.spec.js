import { mount } from '@vue/test-utils'
import { BCardBody, BCardFooter } from 'bootstrap-vue-next'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectForm from '@/components/ProjectForm'

describe('ProjectForm.vue', () => {
  describe('without an existing project', () => {
    let wrapper, plugins

    beforeEach(() => {
      plugins = CoreSetup.init().useAll().plugins
      wrapper = mount(ProjectForm, { global: { plugins } })
    })

    it('should not use b-card-* components by default', () => {
      expect(wrapper.findComponent(BCardBody).exists()).toBeFalsy()
      expect(wrapper.findComponent(BCardFooter).exists()).toBeFalsy()
    })

    it('should not have the .card class by default', async () => {
      expect(wrapper.classes('card')).toBeFalsy()
    })

    it('should use b-card-* components when `card` prop is set', async () => {
      await wrapper.setProps({ card: true })
      expect(wrapper.findComponent(BCardBody).exists()).toBeTruthy()
      expect(wrapper.findComponent(BCardFooter).exists()).toBeTruthy()
    })

    it('should have the .card class when `card` prop is set', async () => {
      await wrapper.setProps({ card: true })
      expect(wrapper.classes('card')).toBeTruthy()
    })

    it('should generate a slugified name when setting the label', async () => {
      await wrapper.find('input[name=label]').setValue('Pandora Papers')
      expect(wrapper.find('input[name=name]').element.value).toBe('pandora-papers')
    })

    it('should generate a slugified name when setting the label, respecting case', async () => {
      await wrapper.find('input[name=label]').setValue('PandoraPapers')
      expect(wrapper.find('input[name=name]').element.value).toBe('pandora-papers')
    })

    it('should not validate the form group if a reserved name is used as label', async () => {
      await wrapper.find('input[name=label]').setValue('new')
      expect(wrapper.find('.project-form__group--label').classes('was-validated')).toBeFalsy()
      expect(wrapper.find('.project-form__group--label .invalid-feedback').exists()).toBeTruthy()
    })

    it('should not validate the form group if an invalid URL for sourceUrl', async () => {
      await wrapper.find('input[name=sourceUrl]').setValue('sftp://foo.bar')
      expect(wrapper.find('.project-form__group--source-url').classes('was-validated')).toBeFalsy()
    })

    it('should validate the form group if a valid URL for sourceUrl', async () => {
      await wrapper.find('input[name=sourceUrl]').setValue('https://foo.bar')
      expect(wrapper.find('.project-form__group--source-url').classes('was-validated')).toBeTruthy()
    })

    it('should not validate the form group if an invalid URL for logoUrl', async () => {
      await wrapper.find('input[name=logoUrl]').setValue('sftp://foo.bar')
      expect(wrapper.find('.project-form__group--logo-url').classes('was-validated')).toBeFalsy()
    })

    it('should validate the form group if a valid URL for logoUrl', async () => {
      await wrapper.find('input[name=logoUrl]').setValue('https://foo.bar')
      expect(wrapper.find('.project-form__group--logo-url').classes('was-validated')).toBeTruthy()
    })

    it('should not submit an invalid form without name', async () => {
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted()).not.toHaveProperty('submit')
    })

    it('should not submit an invalid form with a name but an invalid logoUrl', async () => {
      await wrapper.find('input[name=label]').setValue('foo')
      await wrapper.find('input[name=logoUrl]').setValue('sftp://foo.bar')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted()).not.toHaveProperty('submit')
    })

    it('should not submit an invalid form with a name but an invalid sourceUrl', async () => {
      await wrapper.find('input[name=label]').setValue('foo')
      await wrapper.find('input[name=sourceUrl]').setValue('sftp://foo.bar')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted()).not.toHaveProperty('submit')
    })

    it('should submit a valid form with a label', async () => {
      await wrapper.find('input[name=label]').setValue('foo')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted()).toHaveProperty('submit')
    })

    it('should submit a valid form with a label and a sourceUrl', async () => {
      await wrapper.find('input[name=label]').setValue('foo')
      await wrapper.find('input[name=sourceUrl]').setValue('https://foo.bar')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted()).toHaveProperty('submit')
    })

    it('should submit a valid form with a label and a logoUrl', async () => {
      await wrapper.find('input[name=label]').setValue('foo')
      await wrapper.find('input[name=logoUrl]').setValue('https://foo.bar')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted()).toHaveProperty('submit')
    })

    it('should not submit the form with a reserved word as label', async () => {
      await wrapper.find('input[name=label]').setValue('new')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted()).not.toHaveProperty('submit')
    })

    it('should not disabled any form group by default', () => {
      expect(wrapper.find('fieldset[disabled]').exists()).toBeFalsy()
      expect(wrapper.find('fieldset:not([disabled])').exists()).toBeTruthy()
    })

    it('should disabled all form groups when `disabled` is set', async () => {
      await wrapper.setProps({ disabled: true })
      expect(wrapper.find('fieldset[disabled]').exists()).toBeTruthy()
      expect(wrapper.find('fieldset:not([disabled])').exists()).toBeFalsy()
    })

    it('should not be able to submit the form when `disabled` is set', async () => {
      await wrapper.setProps({ disabled: true })
      await wrapper.find('input[name=label]').setValue('foo')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted()).not.toHaveProperty('submit')
    })

    it('should not hide the sourcePath input', async () => {
      await wrapper.find('input[name=label]').setValue('bar')
      expect(wrapper.find('.project-form__group--source-path').exists()).toBeTruthy()
    })
  })

  describe('with an existing project', () => {
    let wrapper, plugins

    beforeEach(() => {
      const values = { name: 'foo', description: 'A description' }
      const props = { values, edit: true }
      plugins = CoreSetup.init().useAll().plugins
      wrapper = mount(ProjectForm, { global: { plugins }, props })
    })

    it('should initialize the form with default project values', () => {
      expect(wrapper.find('input[name=name]').element.value).toBe('foo')
      expect(wrapper.find('textarea[name=description]').element.value).toBe('A description')
    })

    it('should not update name when label changes', async () => {
      await wrapper.find('input[name=label]').setValue('bar')
      expect(wrapper.find('input[name=name]').element.value).toBe('foo')
    })

    it('should hide the sourcePath input', async () => {
      await wrapper.find('input[name=label]').setValue('bar')
      expect(wrapper.find('.project-form__group--source-path').exists()).toBeFalsy()
    })

    it('should show the delete button', async () => {
      expect(wrapper.find('.project-form__action--delete').exists()).toBe(false)
      await wrapper.setProps({ showDeleteButton: true })
      expect(wrapper.find('.project-form__action--delete').exists()).toBe(true)
    })
  })
})
