import { shallowMount } from '@vue/test-utils'
import { AppIcon } from '@icij/murmur'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayRole from '@/components/Display/DisplayRole.vue'
import { NO_ROLE } from '@/enums/roles.js'
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
    ['INSTANCE_ADMIN', IPhPersonSimpleBike, 'var(--bs-danger)'],
    ['DOMAIN_ADMIN', IPhPersonSimpleRun, 'var(--bs-success)'],
    ['PROJECT_ADMIN', IPhPersonSimpleWalk, 'var(--bs-category-person)'],
    ['PROJECT_EDITOR', IPhPersonSimpleHike, 'var(--bs-warning)'],
    ['PROJECT_MEMBER', IPhPersonSimpleSwim, 'var(--bs-info)'],
    ['PROJECT_VISITOR', IPhPersonSimpleTaiChi, 'var(--bs-secondary)'],
  ])('renders correct icon and color for %s', (role, expectedIcon, expectedColor) => {
    const wrapper = shallowMount(DisplayRole, { global, props: { value: role } })
    expect(wrapper.vm.icon).toBe(expectedIcon)
    expect(wrapper.vm.iconStyle).toEqual({ color: expectedColor })
  })

  it('renders user-square icon with inherit color for NO_ROLE', () => {
    const wrapper = shallowMount(DisplayRole, { global, props: { value: NO_ROLE } })
    expect(wrapper.vm.icon).toBe(IPhUserSquare)
    expect(wrapper.vm.iconStyle).toEqual({ color: 'inherit' })
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
