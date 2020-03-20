import trim from 'lodash/trim'
import IdentityPipeline from './IdentityPipeline'

class AddLineBreaksPipeline extends IdentityPipeline {
  apply (value) {
    return value.split('\n').map(trim).map(row => `<p>${row}</p>`).join('')
  }
}

export default AddLineBreaksPipeline
