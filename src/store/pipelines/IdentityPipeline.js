class IdentityPipeline {
  constructor ({ name, category = null, ...defintion } = {}) {
    this.name = name
    this.category = category
  }
  apply (value) {
    return value
  }
}

export default IdentityPipeline
