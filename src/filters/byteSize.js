export default function byteSize (humanSize) {
  const powers = { k: 1, m: 2, g: 3 }
  const regex = /([0-9]+)([KMG])/

  const res = regex.exec(humanSize)

  return res[1] * Math.pow(1024, powers[res[2].toLowerCase()])
}
