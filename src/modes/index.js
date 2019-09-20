import local from './local'
import server from './server'

export default (mode = 'local') => {
  // Return the right values according to the mode or fallback to `local`
  return { local, server }[mode.toLowerCase()] || local
}
