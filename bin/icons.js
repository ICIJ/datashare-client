import keys from 'lodash/keys.js'
import pickBy from 'lodash/pickBy.js'
import mapValues from 'lodash/mapValues.js'
import * as all from '@phosphor-icons/vue'

export const nameMatch = (name) => name.match(/^Ph[A-Z]/)
export const components = pickBy(all, (value, key) => nameMatch(key))
export const globals = mapValues(components, () => 'readonly')
export const names = keys(components)
