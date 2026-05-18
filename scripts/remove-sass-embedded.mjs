import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(root, '..')

function removeIfExists(relativePath) {
  const target = path.join(projectRoot, relativePath)
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true })
    console.log(`[postinstall] removed ${relativePath}`)
  }
}

removeIfExists('node_modules/sass-embedded')
removeIfExists('node_modules/vite/node_modules/sass-embedded')
