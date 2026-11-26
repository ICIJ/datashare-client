import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector'
import SettingsViewApiKeyForm from '@/views/Settings/SettingsView/SettingsViewApiKeyForm'

describe('SettingsViewApiKeyForm', () => {
  let plugins
  const projects = [{ name: 'banana-papers', label: 'Banana Papers' }]

  function mountForm(props = {}) {
    return mount(SettingsViewApiKeyForm, { global: { plugins }, props: { projects, ...props } })
  }

  function radioValues(wrapper) {
    return wrapper.findAll('input[type=radio]').map(radio => radio.element.value)
  }

  function checkedValue(wrapper) {
    return wrapper.find('input[type=radio]:checked').element.value
  }

  async function submit(wrapper) {
    await wrapper.find('.settings-view-api-key-form').trigger('submit')
    return wrapper.emitted('submit')[0][0]
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-25T12:00:00Z'))
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should offer 7, 30 and 90 days without a cap', () => {
    const wrapper = mountForm()
    expect(radioValues(wrapper)).toEqual(['7', '30', '90'])
  })

  it('should select 30 days by default', () => {
    const wrapper = mountForm()
    expect(checkedValue(wrapper)).toBe('30')
  })

  it('should send the expiration date 30 days from now', async () => {
    const wrapper = mountForm()
    const payload = await submit(wrapper)
    expect(payload).toEqual({ projects: [], expirationDate: '2026-12-25T12:00:00.000Z' })
  })

  it('should send the selected project names', async () => {
    const wrapper = mountForm()
    const selector = wrapper.findComponent(ProjectDropdownSelector)
    await selector.vm.$emit('update:modelValue', [{ name: 'banana-papers' }])
    const payload = await submit(wrapper)
    expect(payload.projects).toEqual(['banana-papers'])
  })

  it('should let the projects selection be empty for all projects', () => {
    const wrapper = mountForm()
    const selector = wrapper.findComponent(ProjectDropdownSelector)
    expect(selector.props('emptyMeansAll')).toBe(true)
  })

  it('should show "All projects" when no project is selected', () => {
    const wrapper = mountForm()
    expect(wrapper.find('.project-dropdown-selector-button-content').text()).toBe('All projects')
  })

  it('should hide presets longer than the cap', () => {
    const wrapper = mountForm({ maxLifetime: 'P30D' })
    expect(radioValues(wrapper)).toEqual(['7', '30'])
  })

  it('should fall back to the largest allowed preset when the default is capped', async () => {
    const wrapper = mountForm({ maxLifetime: 'P10D' })
    expect(radioValues(wrapper)).toEqual(['7'])
    expect(checkedValue(wrapper)).toBe('7')
    const payload = await submit(wrapper)
    expect(payload.expirationDate).toBe('2026-12-02T12:00:00.000Z')
  })

  it('should only offer the max allowed when every preset is capped', async () => {
    const wrapper = mountForm({ maxLifetime: 'P3D' })
    const radios = wrapper.findAll('input[type=radio]')
    expect(radios).toHaveLength(1)
    expect(wrapper.find('.settings-view-api-key-form__expires-in').text()).toContain('Max allowed (3 days)')
    const payload = await submit(wrapper)
    expect(payload).not.toHaveProperty('expirationDate')
  })

  it('should keep a preset equal to the cap one minute under it', async () => {
    const wrapper = mountForm({ maxLifetime: 'P30D' })
    const payload = await submit(wrapper)
    expect(payload.expirationDate).toBe('2026-12-25T11:59:00.000Z')
  })

  it('should cap the presets with a cap in hours', () => {
    const wrapper = mountForm({ maxLifetime: 'PT720H' })
    expect(radioValues(wrapper)).toEqual(['7', '30'])
  })

  it('should cap the presets with a cap mixing days and hours', () => {
    const wrapper = mountForm({ maxLifetime: 'P1DT24H' })
    expect(wrapper.find('.settings-view-api-key-form__expires-in').text()).toContain('Max allowed (2 days)')
  })

  it('should not count days for a cap shorter than a day', () => {
    const wrapper = mountForm({ maxLifetime: 'PT12H' })
    const text = wrapper.find('.settings-view-api-key-form__expires-in').text()
    expect(text).toContain('Max allowed')
    expect(text).not.toContain('days')
  })

  it('should only offer the max allowed for a cap it cannot parse', async () => {
    const wrapper = mountForm({ maxLifetime: 'P1M' })
    expect(wrapper.findAll('input[type=radio]')).toHaveLength(1)
    const payload = await submit(wrapper)
    expect(payload).not.toHaveProperty('expirationDate')
  })

  it('should open the projects menu inside the modal holding the form', async () => {
    const modal = document.createElement('div')
    modal.className = 'modal'
    document.body.appendChild(modal)
    const wrapper = mount(SettingsViewApiKeyForm, { global: { plugins }, props: { projects }, attachTo: modal })
    await wrapper.vm.$nextTick()

    const selector = wrapper.findComponent(ProjectDropdownSelector)
    expect(selector.props('teleportTo')).toBe(modal)
    wrapper.unmount()
    modal.remove()
  })

  it('should disable the submit button when busy', () => {
    const wrapper = mountForm({ busy: true })
    const button = wrapper.find('.settings-view-api-key-form__submit')
    expect(button.attributes()).toHaveProperty('disabled')
  })

  it('should show a spinner on the submit button when busy', () => {
    const wrapper = mountForm({ busy: true })
    const button = wrapper.find('.settings-view-api-key-form__submit')
    expect(button.classes()).toContain('button-icon--loading')
  })

  it('should introduce the key with a link to the API documentation', () => {
    const wrapper = mountForm()
    const link = wrapper.find('.settings-view-api-key-form__intro a[href="https://icij.gitbook.io/datashare/developers/backend/api"]')
    expect(link.exists()).toBe(true)
  })

  it('should explain what happens when the key expires', () => {
    const wrapper = mountForm()
    const expiresIn = wrapper.find('.settings-view-api-key-form__expires-in')
    expect(expiresIn.text()).toContain('After this, scripts using the key stop working.')
  })
})
