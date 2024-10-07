import { execSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Check if there are any uncommitted changes
try {
  execSync('git diff --quiet', { stdio: 'ignore' })
} catch (_: unknown) {
  console.error('Error: There are uncommitted changes in the repository.')
  console.error(
    'Please commit or stash your changes before running this script.',
  )
  process.exit(1)
}

const __filename = fileURLToPath(import.meta.url)
const rootDir = join(dirname(__filename), '..')

// Read the main package.json to get the list of workspaces
const mainPackageJsonPath = join(rootDir, 'package.json')
const mainPackageJson = JSON.parse(readFileSync(mainPackageJsonPath, 'utf-8'))
const workspaces = mainPackageJson.workspaces

// Get the new version from command line arguments
const newVersion = process.argv[2]

if (!newVersion) {
  console.error('Please provide a version number as an argument')
  process.exit(1)
}

// Update version for each workspace
for (const workspace of workspaces) {
  const packageJsonPath = join(rootDir, workspace, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

  // Update version for @workflowai dependencies
  if (packageJson.dependencies) {
    for (const dep of Object.keys(packageJson.dependencies)) {
      if (dep.startsWith('@workflowai/')) {
        packageJson.dependencies[dep] = newVersion
      }
    }
  }

  packageJson.version = newVersion

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  console.log(`Updated version for ${packageJson.name} to ${newVersion}`)
}

// Update version in the root package.json
mainPackageJson.version = newVersion

writeFileSync(mainPackageJsonPath, JSON.stringify(mainPackageJson, null, 2))

console.log(`Updated version in root package.json to ${newVersion}`)

// Run npm install to update package-lock.json
const npmInstallResult = spawnSync('npm', ['install'], {
  stdio: 'inherit',
  cwd: rootDir,
})

if (npmInstallResult.status !== 0) {
  console.error('Failed to run npm install')
  process.exit(1)
}

console.log('All packages have been updated and npm install has been run')
