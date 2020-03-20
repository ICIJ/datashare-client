import IdentityPipeline from './IdentityPipeline'

class SimplePipeline extends IdentityPipeline {
  constructor ({ apply, ...options }) {
    super(options)
    this.apply = apply.bind(this)
  }
}
export default SimplePipeline
