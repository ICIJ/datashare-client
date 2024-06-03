import { isString, uniqueId } from 'lodash'
import { markRaw } from 'vue'

export const defaultOrder = 0
export const defaultDefinition = { template: '<span></span>' }

export class HookedComponent {
  constructor({ target, name, order = defaultOrder, definition = defaultDefinition }) {
    this.name = name || uniqueId('hooked-component-')
    this.target = target
    this.order = order
    this.definition = markRaw(definition)
  }
  get component() {
    if (isString(this.definition)) {
      const template = `<span>${this.definition}</span>`
      return markRaw({ template })
    }
    return this.definition
  }
  static create(...args) {
    return new HookedComponent(...args)
  }
}

export default HookedComponent
