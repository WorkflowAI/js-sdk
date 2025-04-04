import argv from 'minimist';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// @ts-expect-error import.meta is only supported for certain modes
const __filename = fileURLToPath(import.meta.url);
const workspaceDir = join(dirname(__filename), '..');

const {
  _: [version, packageName],
} = argv(process.argv.slice(2)) as {
  _: string[];
};

if (!packageName || !version) {
  console.log('Package name and expected version are required');
  process.exit(1);
}

const rootDir = join(workspaceDir, 'packages', packageName);

// Read the main package.json to get the list of workspaces
const mainPackageJsonPath = join(rootDir, 'package.json');
const mainPackageJson = JSON.parse(readFileSync(mainPackageJsonPath, 'utf-8'));

// Get the expected version from command line arguments or main package.json

if (!version) {
  console.log('Expected version is required');
  process.exit(1);
}

const expectedVersion = version.startsWith('v') ? version.slice(1) : version;

const versionFileContents = readFileSync(
  join(rootDir, 'src/version.ts'),
  'utf-8'
);
const valueFromVersionFile = versionFileContents.match(
  /export const PACKAGE_VERSION = '(.*)';/
)?.[1];

if (!valueFromVersionFile) {
  console.error('Version file does not contain a valid version');
  process.exit(1);
}

if (valueFromVersionFile !== expectedVersion) {
  console.error(
    `Version file contains a different version: ${valueFromVersionFile}`
  );
  process.exit(1);
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
