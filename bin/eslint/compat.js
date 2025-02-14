import path from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const filepath = fileURLToPath(import.meta.url)
const baseDirectory = path.dirname(filepath)
const compat = new FlatCompat({ baseDirectory })

export default compat
