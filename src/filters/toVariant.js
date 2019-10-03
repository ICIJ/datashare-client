import settings from '@/utils/settings'
import { slugger } from '@/utils/strings'

export default function (string = '', defaultVariant = 'darker') {
  return settings.variantsMap[slugger(string)] || defaultVariant
}
