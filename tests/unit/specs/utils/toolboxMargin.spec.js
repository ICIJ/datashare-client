import { belowToolboxMargin } from '@/utils/toolboxMargin'

describe('belowToolboxMargin', () => {
  it('shrinks the top of the root just past the rounded toolbox height', () => {
    expect(belowToolboxMargin(41.6)).toBe('-46px 0px 0px 0px')
  })
})
