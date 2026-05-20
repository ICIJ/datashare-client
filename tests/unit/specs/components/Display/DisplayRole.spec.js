import { shallowMount } from '@vue/test-utils'
import { AppIcon } from '@icij/murmur-next'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayRole from '@/components/Display/DisplayRole.vue'
import IPhPersonSimpleBike from '~icons/ph/person-simple-bike'
import IPhPersonSimpleRun from '~icons/ph/person-simple-run'
import IPhPersonSimpleWalk from '~icons/ph/person-simple-walk'
import IPhPersonSimpleHike from '~icons/ph/person-simple-hike'
import IPhPersonSimpleSwim from '~icons/ph/person-simple-swim'
import IPhPersonSimpleTaiChi from '~icons/ph/person-simple-tai-chi'
import IPhUserSquare from '~icons/ph/user-square'

describe('DisplayRole.vue', () => {
  let core, global

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins }
  })

  it.each([
    ['INSTANCE_ADMIN', IPhPersonSimpleBike, '#DC3545'],
    ['DOMAIN_ADMIN',   IPhPersonSimpleRun,  '#00BB84'],
    ['PROJECT_ADMIN',  IPhPersonSimpleWalk, '#FF6699'],
    ['PROJECT_EDITOR', IPhPersonSimpleHike, '#FFB53E'],
    ['PROJECT_MEMBER', IPhPersonSimpleSwim, '#45C4FF'],
    ['PROJECT_VISITOR', IPhPersonSimpleTaiChi, '#6F6F6F'],
  ])('renders correct icon and color for %s', (role, expectedIcon, expectedColor) => {
    const wrapper = shallowMount(DisplayRole, { global, props: { value: role } })
    expect(wrapper.vm.icon).toBe(expectedIcon)
    expect(wrapper.vm.iconStyle).toEqual({ color: expectedColor })
  })

  it('falls back to user-square icon with inherit color for unknown role', () => {
    const wrapper = shallowMount(DisplayRole, { global, props: { value: 'UNKNOWN' } })
    expect(wrapper.vm.icon).toBe(IPhUserSquare)
    expect(wrapper.vm.iconStyle).toEqual({ color: 'inherit' })
  })

  it('hides AppIcon when noIcon is true', () => {
    const wrapper = shallowMount(DisplayRole, { global, props: { value: 'INSTANCE_ADMIN', noIcon: true } })
    expect(wrapper.findComponent(AppIcon).exists()).toBe(false)
  })
})
