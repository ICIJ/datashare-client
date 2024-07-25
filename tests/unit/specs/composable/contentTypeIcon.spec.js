import { useContentType } from '@/composable/contentTypeIcon'

describe('useContentType', () => {
  it('Retrieves image phosphor icon file-code the given text/html content type ', () => {
    const { getUmbrellaIcon } = useContentType()
    expect(getUmbrellaIcon('text/html')).toEqual('file-code')
  })

  it('Retrieves default  phosphor file icon if file type is unknown ', () => {
    const { getUmbrellaIcon } = useContentType()
    expect(getUmbrellaIcon('unknown')).toEqual('file')
  })
})
