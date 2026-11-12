import { markRaw } from 'vue'
import IPhFile from '~icons/ph/file'
import IPhFolder from '~icons/ph/folder'
import IPhLock from '~icons/ph/lock'
import IPhPlug from '~icons/ph/plug'

export const ERROR_REASONS = Object.freeze({
  notFound: { code: 404, back: true },
  forbidden: { icon: markRaw(IPhLock), back: true },
  noProjects: { icon: markRaw(IPhFolder), retry: true, logout: true },
  serverUnreachable: { icon: markRaw(IPhPlug), retry: true },
  document: { icon: markRaw(IPhFile), retry: true, back: true, hidesCode: true }
})
