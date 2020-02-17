import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import ShortkeysModal from '@/components/ShortkeysModal'

jest.mock('@/utils/shortkeys.json', () => {
  return {
    Component1: {
      actionToExecute1: {
        keys: {
          mac: ['meta', 'key_01'],
          default: ['ctrl', 'key_01']
        },
        action: 'action_01',
        icon: 'icon_01'
      },
      actionToExecute2: {
        keys: {
          mac: ['meta', 'key_02'],
          default: ['ctrl', 'key_02']
        },
        action: 'action_02'
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
        }
      }
    }
  }
})

const { localVue } = Core.init(createLocalVue()).useAll()

describe('ShortkeysModal', () => {
  let label, wrapper

  beforeEach(() => {
    wrapper = shallowMount(ShortkeysModal, { localVue, mocks: { $t: msg => msg, $te: () => true } })
  })

  it('should display the shortkeys modal', () => {
    expect(wrapper.findAll('.shortkeys-modal').exists()).toBeTruthy()
  })

  it('should extract shortkeys keys and action on component creation', () => {
    expect(wrapper.vm.shortkeys).toHaveLength(4)
    expect(wrapper.vm.shortkeys).toEqual([
      { keys: { mac: ['meta', 'key_01'], default: ['ctrl', 'key_01'] }, action: 'action_01', icon: 'icon_01' },
      { keys: { mac: ['meta', 'key_02'], default: ['ctrl', 'key_02'] }, action: 'action_02' },
      { keys: { mac: ['meta', 'key_03'], default: ['ctrl', 'key_03'] }, action: 'action_03', icon: 'icon_03', label: 'This is a translation' },
      { keys: { mac: ['meta', 'key_04'], default: ['ctrl', 'key_04'] }, action: 'action_04', icon: 'icon_04' }
    ])
  })

  describe('Shortkey label', () => {
    it('should return the translation of the label if there is one', () => {
      label = wrapper.vm.getLabel({ keys: { mac: ['meta', 'key_01'], default: ['ctrl', 'key_01'] }, action: 'action_01', label: 'key.subkey' })

      expect(label).toBe('key.subkey')
    })

    it('should return the label if there is one', () => {
      label = wrapper.vm.getLabel({ keys: { mac: ['meta', 'key_01'], default: ['ctrl', 'key_01'] }, action: 'action_01', label: 'There is no translation' })

      expect(label).toBe('There is no translation')
    })

    it('should return the action of a key if there is no label', () => {
      label = wrapper.vm.getLabel({ keys: { mac: ['meta', 'key_01'], default: ['ctrl', 'key_01'] }, action: 'action_01' })

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
