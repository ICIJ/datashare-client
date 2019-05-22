import DatashareClient from '@/api/DatashareClient'

const ds = new DatashareClient()
export const mixin = {
  methods: {
    getSource (document) {
      return ds.getSource(document)
    }
  }
}

export default mixin
