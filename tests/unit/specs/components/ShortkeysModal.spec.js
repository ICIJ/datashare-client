import { createLocalVue, shallowMount } from '@vue/test-utils'
import ShortkeysModal from '@/components/ShortkeysModal'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'

jest.mock('@/utils/shortkeys.json', () => {
  return {
    Component1: {
      actionToExecute1: {
        keys: {
          mac: ['meta', 'key1'],
          default: ['ctrl', 'key1']
        },
        action: 'action1',
        icon: 'icon1'
      },
      actionToExecute2: {
        keys: {
          mac: ['meta', 'key2'],
          default: ['ctrl', 'key2']
        },
        action: 'action2'
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
        action: 'action3',
        label: {
          action_03: 'This is a translation'
        }
      }
    }
  }
})

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(Murmur)

describe('ShortkeysModal.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ShortkeysModal, { localVue, mocks: { $t: msg => msg === 'key.subkey' ? 'Action label' : msg, $te: () => true } })
  })

  it('should display the shortkeys modal', () => {
    expect(wrapper.findAll('.shortkeys-modal').exists()).toBeTruthy()
  })

  it('should extract shortkeys keys and action on component creation', () => {
    expect(wrapper.vm.shortkeys).toHaveLength(4)
    expect(wrapper.vm.shortkeys).toEqual([
      { keys: { mac: ['meta', 'key1'], default: ['ctrl', 'key1'] }, action: 'action1', icon: 'icon1' },
      { keys: { mac: ['meta', 'key2'], default: ['ctrl', 'key2'] }, action: 'action2' },
      { keys: { mac: ['meta', 'key_03'], default: ['ctrl', 'key_03'] }, action: 'action_03', label: 'This is a translation' },
      { keys: { mac: ['meta', 'key_04'], default: ['ctrl', 'key_04'] }, action: 'action_04' }
    ])
  })

  describe('Shortkey label', () => {
    it('should return the translation of the label if there is one', () => {
      const label = wrapper.vm.getLabel({ keys: { mac: ['meta', 'key1'], default: ['ctrl', 'key1'] }, action: 'action1', label: 'key.subkey' })

      expect(label).toEqual('Action label')
    })

    it('should return the label if there is one', () => {
      const label = wrapper.vm.getLabel({ keys: { mac: ['meta', 'key1'], default: ['ctrl', 'key1'] }, action: 'action1', label: 'There is no translation' })

      expect(label).toEqual('There is no translation')
    })

    it('should return the action of a key if there is no label', () => {
      const label = wrapper.vm.getLabel({ keys: { mac: ['meta', 'key1'], default: ['ctrl', 'key1'] }, action: 'action1' })

      expect(label).toEqual('action1')
    })
  })
})
