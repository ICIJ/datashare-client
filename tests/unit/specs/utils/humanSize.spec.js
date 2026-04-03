import humanSize from '@/utils/humanSize'

describe('humanSize filter', () => {
  it('should return "—" if size equals -1', () => {
    expect(humanSize(-1)).toBe('—')
  })

  it('should return "—" if size is an empty string', () => {
    expect(humanSize('')).toBe('—')
  })

  it('should return "—" if size is undefined', () => {
    expect(humanSize(undefined)).toBe('—')
  })

  it('should display human readable size for 0', () => {
    expect(humanSize(0)).toBe('0 B')
  })

  it('should display human readable size for Bytes', () => {
    expect(humanSize(12)).toBe('12 B')
  })

  it('should display human readable size for Kilobytes WITHOUT bytes', () => {
    expect(humanSize(10342, false)).toBe('10.1 KB')
  })

  it('should display human readable size for Kilobytes WITH bytes', () => {
    expect(humanSize(10342, true)).toBe('10.1 KB (10342 B)')
  })

  it('should display human readable size for Megabytes WITHOUT bytes', () => {
    expect(humanSize(12345678, false)).toBe('11.77 MB')
  })

  it('should display human readable size for Megabytes WITH bytes', () => {
    expect(humanSize(12345678, true)).toBe('11.77 MB (12345678 B)')
  })

  it('should strip trailing zeros for a round Gigabyte value', () => {
    expect(humanSize(1073741824, false)).toBe('1 GB')
  })

  it('should strip only the trailing zero for a value with one significant decimal', () => {
    expect(humanSize(1610612736, false)).toBe('1.5 GB')
  })
})
