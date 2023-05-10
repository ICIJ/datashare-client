import { createLocalVue, shallowMount } from '@vue/test-utils'

import ShortkeysModal from '@/components/ShortkeysModal'
import { Core } from '@/core'

jest.mock('@/utils/shortkeys.json', () => {
  return {
    Component1: {
      actionToExecute1: {
        keys: {
          mac: ['meta', 'key_01'],
          default: ['ctrl', 'key_01']
        },
        action: 'action_01',
        icon: 'icon_01',
        page: ''
      },
      actionToExecute2: {
        keys: {
          mac: ['meta', 'key_02'],
          default: ['ctrl', 'key_02']
        },
        action: 'action_02',
        page: ''
      }
    },
    Component2: {
      actionToExecute3: {
        keys: {
          mac: {
            action_03: ['meta', 'key_03'],
            action_04: ['meta', 'key_04']
          },
          default: {
            action_03: ['ctrl', 'key_03'],
            action_04: ['ctrl', 'key_04']
          }
        },
        action: 'action_03',
        icon: {
          action_03: 'icon_03',
          action_04: 'icon_04'
        },
        label: {
          action_03: 'This is a translation'
        },
        page: ''
      }
    },
    Component3: {
      actionToExecute5: {
        keys: {
          default: ['key_05']
        },
        action: 'action_05',
        icon: 'icon_05',
        page: 'page_05'
      }
    }
  }
})

describe('ShortkeysModal', () => {
  const { localVue, i18n } = Core.init(createLocalVue()).useAll()
  let label = null
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(ShortkeysModal, { i18n, localVue })
  })

  it('should display the shortkeys modal', () => {
    expect(wrapper.findAll('.shortkeys-modal').exists()).toBeTruthy()
  })

  it('should filter shortkeys that are not for the current page', () => {
    expect(wrapper.vm.flatShortkeys).toHaveLength(4)
  })

  it('should extract shortkeys keys and action on component creation', () => {
    expect(wrapper.vm.flatShortkeys).toHaveLength(4)
    expect(wrapper.vm.flatShortkeys).toEqual([
      expect.objectContaining({
        keys: { mac: ['meta', 'key_01'], default: ['ctrl', 'key_01'] },
        action: 'action_01',
        icon: 'icon_01',
        page: ''
      }),
      expect.objectContaining({
        keys: { mac: ['meta', 'key_02'], default: ['ctrl', 'key_02'] },
        action: 'action_02',
        page: ''
      }),
      expect.objectContaining({
        keys: { mac: ['meta', 'key_03'], default: ['ctrl', 'key_03'] },
        action: 'action_03',
        icon: 'icon_03',
        label: 'This is a translation'
      }),
      expect.objectContaining({
        keys: { mac: ['meta', 'key_04'], default: ['ctrl', 'key_04'] },
        action: 'action_04',
        icon: 'icon_04'
      })
    ])
  })

  describe('Shortkey label', () => {
    it('should return the translation of the label if there is one', () => {
      label = wrapper.vm.getLabel({
        keys: { mac: ['meta', 'key_01'], default: ['ctrl', 'key_01'] },
        action: 'action_01',
        label: 'key.subkey'
      })

      expect(label).toBe('key.subkey')
    })

    it('should return the label if there is one', () => {
      label = wrapper.vm.getLabel({
        keys: { mac: ['meta', 'key_01'], default: ['ctrl', 'key_01'] },
        action: 'action_01',
        label: 'There is no translation'
      })

      expect(label).toBe('There is no translation')
    })

    it('should return the action of a key if there is no label', () => {
      label = wrapper.vm.getLabel({
        keys: { mac: ['meta', 'key_01'], default: ['ctrl', 'key_01'] },
        action: 'action_01'
      })

      expect(label).toBe('action_01')
    })
  })

  describe('Shortkey icon', () => {
    it('should display an icon if is set', () => {
      expect(wrapper.find('b-modal-stub b-link-stub:nth-child(1) fa-stub').attributes('icon')).toEqual('icon_01')
    })

    it('should not display the icon if not set', () => {
      expect(wrapper.find('b-modal-stub b-link-stub:nth-child(2) fa-stub').exists()).toBeFalsy()
    })
  })
})
