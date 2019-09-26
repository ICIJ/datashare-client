import { slugger } from '@/utils/strings'

export default function (string = '', defaultVariant = 'darker') {
  switch (slugger(string)) {
    case 'success': return 'success'
    case 'ok': return 'success'
    case 'done': return 'success'
    case 'danger': return 'danger'
    case 'error': return 'danger'
    case 'fail': return 'danger'
    case 'failed': return 'danger'
    case 'info': return 'info'
    case 'pending': return 'info'
    case 'queued': return 'info'
    case 'running': return 'info'
    case 'warning': return 'warning'
    case 'cancelled': return 'warning'
    default: return defaultVariant
  }
}
