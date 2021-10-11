import local from './local'
import server from './server'

export default (modeName = 'local') => {
  // Return the right values according to the mode or fallback to `local`
  const modes = { local, server }
  return modes[modeName.toLowerCase()] || local
}
