import local from './local'

export default Object.assign({ ...local }, {
  multiTenant: true,
  multipleProjects: true,
  manageDocuments: false,
  helpLink: 'https://jira.icij.org/servicedesk/customer/portal/4/create/108'
})
