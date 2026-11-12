import IPhFile from '~icons/ph/file'
import IPhFolder from '~icons/ph/folder'
import IPhLock from '~icons/ph/lock'
import IPhPlug from '~icons/ph/plug'

export default {
  notFound: { code: 404, actions: ['home', 'back'] },
  forbidden: { icon: IPhLock, actions: ['home', 'back'] },
  noProjects: { icon: IPhFolder, actions: ['retry', 'logout'] },
  serverUnreachable: { icon: IPhPlug, actions: ['retry'] },
  document: { icon: IPhFile, actions: ['retry', 'search', 'home'] }
}
