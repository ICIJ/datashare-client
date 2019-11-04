import store from '@/store'

describe('TreeView store', () => {
  describe('should set folder as open, parent folder as open but sibling folder as NOT open', () => {
    beforeAll(() => store.commit('treeView/addPath', '/path/to/folder_11'))

    it('should set folder as open', () => {
      expect(store.getters['treeView/isOpen']('/path/to/folder_11')).toBeTruthy()
    })

    it('should set parent folder as open', () => {
      expect(store.getters['treeView/isOpen']('/path/to')).toBeTruthy()
    })

    it('should set sibling folder as NOT open', () => {
      expect(store.getters['treeView/isOpen']('/path/to/folder_1')).toBeFalsy()
    })
  })
})
