import assert from 'node:assert'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const rootDir = join(dirname(__filename), '../..')

// Read project package.json to get list of workspaces IN ORDER
// Order is important to publish, because packages depend on each other
const projectPackageSpecs = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8')) as { workspaces: string[] }

// Lookup packages on NPM
const lookupCmd = spawnSync('npm', [
  'search',
  '-p',
  '--json',
  '--no-color',
  '--no-description',
  '@workflowai'
])

assert(!lookupCmd.error, lookupCmd.error)
assert(!lookupCmd.stderr.toString(), `Failed to lookup packages on NPM: ${lookupCmd.stderr.toString()}`)

const npmPackages = JSON.parse(lookupCmd.stdout.toString()) as { name: string, version: string }[]

for (const workspacePath of projectPackageSpecs.workspaces) {
  const localPackageJsonFilePath = join(rootDir, workspacePath, 'package.json')

  // Read local package.json
  const localPackageSpecs = JSON.parse(readFileSync(localPackageJsonFilePath, 'utf-8')) as { name: string, version: string }

  // Find published package
  const npmPackage = npmPackages.find(({ name }) => name === localPackageSpecs.name)
  if (!npmPackage) {
    continue
  }

  // Check that the published version is not the same as the local one
  if (npmPackage.version === localPackageSpecs.version) {
    continue
  }

  // Publish!
  const publishCmd = spawnSync('npm', [
    'pub',
    `-w=${npmPackage.name}`,
  ])

  assert(!publishCmd.error, publishCmd.error)
  assert(!publishCmd.stderr.toString(), `Failed to publish ${localPackageSpecs.name}@${localPackageSpecs.version}: ${publishCmd.stderr.toString()}`)

  console.log(`Published ${localPackageSpecs.name}@${localPackageSpecs.version} to NPM`)
}