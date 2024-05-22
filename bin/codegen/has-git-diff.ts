import * as core from '@actions/core'
import assert from 'node:assert'
import { spawnSync } from 'node:child_process'

// Check if there are any git diff pending
const gitDiffCmd = spawnSync('git', ['diff'])
assert(!gitDiffCmd.error, gitDiffCmd.error)
assert(!gitDiffCmd.stderr.toString(), `Failed to run git diff: ${gitDiffCmd.stderr.toString()}`)

const diffResult = gitDiffCmd.stdout.toString()
const hasDiff: boolean = diffResult.length > 0

if (hasDiff) {
  console.log('Git changes are pending')
}
else {
  console.log('No git changes')
}

core.setFailed('No git changes')