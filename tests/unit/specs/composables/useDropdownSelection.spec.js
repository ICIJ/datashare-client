import { ref } from 'vue'

import { useDropdownSelection } from '@/composables/useDropdownSelection'

describe('useDropdownSelection', () => {
  const projects = [{ name: 'a', label: 'A' }, { name: 'b', label: 'B' }, { name: 'c', label: 'C' }]

  function setup(modelValueInit, multipleInit) {
    const modelValue = ref(modelValueInit)
    const allOptions = ref(projects)
    const multiple = ref(multipleInit)
    const api = useDropdownSelection(modelValue, allOptions, { multiple, optionKey: 'name' })
    return { modelValue, api }
  }

  it('reports selected keys for a multiple selection', () => {
    const { api } = setup([{ name: 'a' }, { name: 'b' }], true)
    expect(api.selectedKeys.value).toEqual(['a', 'b'])
  })

  it('reports selected key for a single selection', () => {
    const { api } = setup({ name: 'b' }, false)
    expect(api.selectedKeys.value).toEqual(['b'])
    expect(api.isSelected({ name: 'b' })).toBe(true)
    expect(api.isSelected({ name: 'a' })).toBe(false)
  })

  it('replaces the value in single-select mode when toggling', () => {
    const { modelValue, api } = setup({ name: 'a' }, false)
    api.toggleValue(null, { name: 'c' })
    expect(modelValue.value).toEqual({ name: 'c' })
  })

  it('adds and removes values in multiple mode', () => {
    const { modelValue, api } = setup([{ name: 'a' }], true)
    api.toggleValue({ stopPropagation() {} }, { name: 'b' })
    expect(modelValue.value.map(v => v.name)).toEqual(['a', 'b'])
    api.toggleValue({ stopPropagation() {} }, { name: 'a' })
    expect(modelValue.value.map(v => v.name)).toEqual(['b'])
  })

  it('never removes the last value in multiple mode', () => {
    const { modelValue, api } = setup([{ name: 'a' }], true)
    api.toggleValue({ stopPropagation() {} }, { name: 'a' })
    expect(modelValue.value.map(v => v.name)).toEqual(['a'])
  })

  it('toggleUniqueValue selects a single value even in multiple mode', () => {
    const { modelValue, api } = setup([{ name: 'a' }, { name: 'b' }], true)
    api.toggleUniqueValue(null, { name: 'c' })
    expect(modelValue.value.map(v => v.name)).toEqual(['c'])
  })

  it('selectAll selects every option, unselectAll keeps the first', () => {
    const { modelValue, api } = setup([{ name: 'a' }], true)
    api.selectAll()
    expect(modelValue.value.map(v => v.name)).toEqual(['a', 'b', 'c'])
    api.unselectAll()
    expect(modelValue.value.map(v => v.name)).toEqual(['a'])
  })

  it('isRequiredSelection is true for the only selected option in multiple mode', () => {
    const { api } = setup([{ name: 'a' }], true)
    expect(api.isRequiredSelection({ name: 'a' })).toBe(true)
  })

  it('isRequiredSelection is false when more than one option is selected', () => {
    const { api } = setup([{ name: 'a' }, { name: 'b' }], true)
    expect(api.isRequiredSelection({ name: 'a' })).toBe(false)
    expect(api.isRequiredSelection({ name: 'b' })).toBe(false)
  })

  it('isRequiredSelection is false for an unselected option', () => {
    const { api } = setup([{ name: 'a' }], true)
    expect(api.isRequiredSelection({ name: 'b' })).toBe(false)
  })

  it('isRequiredSelection is false in single-select mode', () => {
    const { api } = setup({ name: 'a' }, false)
    expect(api.isRequiredSelection({ name: 'a' })).toBe(false)
  })
})
