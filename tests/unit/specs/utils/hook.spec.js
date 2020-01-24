import HookedComponent from '@/utils/hookedComponent'

describe('HookedComponent', () => {
  it('should have an target attribute', () => {
    const hc = new HookedComponent({ target: 'foo' })
    expect(hc).toHaveProperty('target')
  })

  it('should have a default order attribute', () => {
    const hc = new HookedComponent({ target: 'foo' })
    expect(hc).toHaveProperty('order')
  })

  it('should have a default definition attribute', () => {
    const hc = new HookedComponent({ target: 'foo' })
    expect(hc).toHaveProperty('definition')
  })

  it('should get a component definition', () => {
    const hc = new HookedComponent({ target: 'foo', definition: { template: '<span>Yolo</span>' } })
    expect(hc.component).toHaveProperty('template')
    expect(hc.component.template).toContain('Yolo')
  })

  it('should get a component definition  from a string', () => {
    const hc = new HookedComponent({ target: 'foo', definition: 'Yolo' })
    expect(hc.component).toHaveProperty('template')
    expect(hc.component.template).toContain('Yolo')
  })

  it('should instance a HookedComponent class', () => {
    const hc = HookedComponent.create({ target: 'foo', definition: 'Yolo' })
    expect(hc instanceof HookedComponent).toBeTruthy()
  })
})
