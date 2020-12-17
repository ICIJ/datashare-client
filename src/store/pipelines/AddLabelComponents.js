import castArray from 'lodash/castArray'
import isString from 'lodash/isString'
import IdentityPipeline from './IdentityPipeline'

class AddLabelComponents extends IdentityPipeline {
  apply (value) {
    return castArray(value).map(({ label, ...obj }) => {
      // If the given label is a string,
      // this pipeline will wrap it into a tiny component that
      // use the label as translation key.
      if (isString(label)) {
        const template = '<span>{{ $t(label) }}</span>'
        // Data object must come from a function with Vue components
        const data = () => ({ label })
        const labelComponent = { template, data }
        // Order matters!
        // If the `obj` already contains a `labelComponent` property, it won't
        // be overridden by the component we just created with the label string.
        return { label, labelComponent, ...obj }
      }
      return { label, labelComponent: label, ...obj }
    })
  }
}

export default AddLabelComponents
