import assert from 'node:assert'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import argv from 'minimist'

const __filename = fileURLToPath(import.meta.url)
const rootDir = join(dirname(__filename), '../..')

// We'll tag published package version differently depending on which branch this action is triggered from
const { branch } = argv(process.argv.slice(2)) as { _: string[], branch?: string }
const isMainBranch = branch === 'main'

// Read project package.json to get list of workspaces IN ORDER
// Order is important to publish, because packages depend on each other
const projectPackageSpecs = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8')) as { workspaces: string[] }

for (const workspacePath of projectPackageSpecs.workspaces) {
  const localPackageJsonFilePath = join(rootDir, workspacePath, 'package.json')

  // Read local package.json
  const localPackageSpecs = JSON.parse(readFileSync(localPackageJsonFilePath, 'utf-8')) as { name: string, version: string }

  // Find published package versions
  const npmVersionsCmd = spawnSync('npm', [
    'view',
    localPackageSpecs.name,
    'versions',
    '--json'
  ])
  assert(!npmVersionsCmd.error, npmVersionsCmd.error)
  assert(!npmVersionsCmd.stderr.toString(), `Failed to lookup package versions on NPM: ${npmVersionsCmd.stderr.toString()}`)

  const npmVersions = JSON.parse(npmVersionsCmd.stdout.toString()) as string[]

  // Tag a version as "next" if it is a prerelease or if we are not on main branch
  const tag = (isMainBranch && !localPackageSpecs.version.includes('-')) ? 'latest' : 'next'

  // Publish only if version doesn't already exist
  if (!npmVersions.includes(localPackageSpecs.version)) {
    // Version had not been published yet, so do it!
    const publishCmd = spawnSync('npm', [
      'pub',
      `-w=${localPackageSpecs.name}`,
      `--tag ${tag}`,
    ])
  
    assert(!publishCmd.error, publishCmd.error)
    assert(!publishCmd.stderr.toString(), `Failed to publish ${localPackageSpecs.name}@${localPackageSpecs.version}: ${publishCmd.stderr.toString()}`)
  
    console.log(`Published ${localPackageSpecs.name}@${localPackageSpecs.version} to NPM with tag "${tag}"`)
  }
  else {
    // Version has been published, so just make sure the correct tag is applied to it
    const tagCmd = spawnSync('npm', [
      'dist-tag',
      `add`,
      `${localPackageSpecs.name}@${localPackageSpecs.version}`,
      tag,
    ])
  
    assert(!tagCmd.error, tagCmd.error)
    assert(!tagCmd.stderr.toString(), `Failed to add tag "${tag}" to ${localPackageSpecs.name}@${localPackageSpecs.version}: ${tagCmd.stderr.toString()}`)
  
    console.log(`Added tag "${tag}" to ${localPackageSpecs.name}@${localPackageSpecs.version} on NPM`)
  }
}