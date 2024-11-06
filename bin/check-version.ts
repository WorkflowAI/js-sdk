import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = join(dirname(__filename), '..');

// Read the main package.json to get the list of workspaces
const mainPackageJsonPath = join(rootDir, 'package.json');
const mainPackageJson = JSON.parse(readFileSync(mainPackageJsonPath, 'utf-8'));

// Get the expected version from command line arguments or main package.json
let expectedVersion = process.argv[2];

if (!expectedVersion) {
  console.log('Expected version is required');
  process.exit(1);
}

if (expectedVersion.startsWith('v')) {
  expectedVersion = expectedVersion.slice(1);
}

const allVersionsMatch = mainPackageJson.version === expectedVersion;

// Check version for each workspace

if (allVersionsMatch) {
  console.log(
    `All package versions match the expected version: ${expectedVersion}`
  );
  process.exit(0);
} else {
  console.error(
    'Version check failed. Please ensure all package.json files have the same version.'
  );
  process.exit(1);
}
