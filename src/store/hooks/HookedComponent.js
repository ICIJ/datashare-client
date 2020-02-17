import isString from 'lodash/isString'

export const defaultOrder = 0
export const defaultDefinition = { template: '<span></span>' }

export class HookedComponent {
  constructor ({ target, order = defaultOrder, definition = defaultDefinition }) {
    this.target = target
    this.order = order
    this.definition = definition
  }
  get component () {
    if (isString(this.definition)) {
      const template = `<span>${this.definition}</span>`
      return { template }
    }
    return this.definition
  }
  static create (...args) {
    return new HookedComponent(...args)
  }
}

export default HookedComponent
