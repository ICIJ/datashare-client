import local from './local'

export default Object.assign({ ...local }, {
  modeName: 'server',
  multipleProjects: true,
  manageDocuments: false
})
