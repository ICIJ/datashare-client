class IdentityPipeline {
  constructor({ name, category = null, order = 0 } = {}) {
    this.name = name
    this.category = category
    this.order = order
  }
  apply(value) {
    return value
  }
}

export default IdentityPipeline
