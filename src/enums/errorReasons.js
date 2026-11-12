import { markRaw } from 'vue'
import IPhFile from '~icons/ph/file'
import IPhFolder from '~icons/ph/folder'
import IPhLock from '~icons/ph/lock'
import IPhPlug from '~icons/ph/plug'

export const ERROR_REASONS = Object.freeze({
  notFound: { code: 404, actions: ['home', 'back'] },
  forbidden: { icon: markRaw(IPhLock), actions: ['home', 'back'] },
  noProjects: { icon: markRaw(IPhFolder), actions: ['retry', 'logout'] },
  serverUnreachable: { icon: markRaw(IPhPlug), actions: ['retry'] },
  document: { icon: markRaw(IPhFile), actions: ['retry', 'home'], hidesCode: true }
})
