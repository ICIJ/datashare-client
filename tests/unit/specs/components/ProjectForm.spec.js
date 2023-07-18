import { createLocalVue, mount } from '@vue/test-utils'

import ProjectForm from '@/components/ProjectForm'
import { Core } from '@/core'

const { localVue, i18n, wait, store, config } = Core.init(createLocalVue()).useAll()

describe('ProjectForm.vue', () => {
  let wrapper

  describe('without an existing project', () => {
    beforeEach(() => {
      wrapper = mount(ProjectForm, { localVue, i18n, wait, store, config })
    })

    it('should not use b-card-* components by default', () => {
      expect(wrapper.findComponent({ name: 'b-card-body' }).exists()).toBeFalsy()
      expect(wrapper.findComponent({ name: 'b-card-footer' }).exists()).toBeFalsy()
    })

    it('should not have the .card class by default', async () => {
      expect(wrapper.classes('card')).toBeFalsy()
    })

    it('should use b-card-* components when `card` prop is set', async () => {
      await wrapper.setProps({ card: true })
      expect(wrapper.findComponent({ name: 'b-card-body' }).exists()).toBeTruthy()
      expect(wrapper.findComponent({ name: 'b-card-footer' }).exists()).toBeTruthy()
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
      await wrapper.trigger('submit')
      expect(wrapper.emitted().submit).toBeFalsy()
    })

    it('should not submit an invalid form with a name but an invalid logoUrl', async () => {
      await wrapper.find('input[name=label]').setValue('foo')
      await wrapper.find('input[name=logoUrl]').setValue('sftp://foo.bar')
      await wrapper.trigger('submit')
      expect(wrapper.emitted().submit).toBeFalsy()
    })

    it('should not submit an invalid form with a name but an invalid sourceUrl', async () => {
      await wrapper.find('input[name=label]').setValue('foo')
      await wrapper.find('input[name=sourceUrl]').setValue('sftp://foo.bar')
      await wrapper.trigger('submit')
      expect(wrapper.emitted().submit).toBeFalsy()
    })

    it('should submit a valid form with a label', async () => {
      await wrapper.find('input[name=label]').setValue('foo')
      await wrapper.trigger('submit')
      expect(wrapper.emitted().submit).toBeTruthy()
    })

    it('should submit a valid form with a label and a sourceUrl', async () => {
      await wrapper.find('input[name=label]').setValue('foo')
      await wrapper.find('input[name=sourceUrl]').setValue('https://foo.bar')
      await wrapper.trigger('submit')
      expect(wrapper.emitted().submit).toBeTruthy()
    })

    it('should submit a valid form with a label and a logoUrl', async () => {
      await wrapper.find('input[name=label]').setValue('foo')
      await wrapper.find('input[name=logoUrl]').setValue('https://foo.bar')
      await wrapper.trigger('submit')
      expect(wrapper.emitted().submit).toBeTruthy()
    })

    it('should not submit the form with a reserved word as label', async () => {
      await wrapper.find('input[name=label]').setValue('new')
      await wrapper.trigger('submit')
      expect(wrapper.emitted().submit).toBeFalsy()
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
      await wrapper.trigger('submit')
      expect(wrapper.emitted().submit).toBeFalsy()
    })

    it('should not hide the sourcePath input', async () => {
      await wrapper.find('input[name=label]').setValue('bar')
      expect(wrapper.find('.project-form__group--source-path').exists()).toBeTruthy()
    })
  })

  describe('with an existing project', () => {
    beforeEach(() => {
      const values = { name: 'foo', description: 'A description' }
      const propsData = { values, edit: true }
      wrapper = mount(ProjectForm, { localVue, i18n, wait, store, config, propsData })
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
  })
})
