import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const rootDir = join(dirname(__filename), "..");

// Read the main package.json to get the list of workspaces
const mainPackageJsonPath = join(rootDir, "package.json");
const mainPackageJson = JSON.parse(readFileSync(mainPackageJsonPath, "utf-8"));
const workspaces = mainPackageJson.workspaces;

// Get the expected version from command line arguments or main package.json
let expectedVersion = process.argv[2] || mainPackageJson.version;

if (expectedVersion.startsWith("v")) {
  expectedVersion = expectedVersion.slice(1);
}

let allVersionsMatch = true;

// Check version for each workspace
for (const workspace of workspaces) {
  const packageJsonPath = join(rootDir, workspace, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  if (packageJson.version !== expectedVersion) {
    console.error(
      `Version mismatch in ${workspace}/package.json: expected ${expectedVersion}, found ${packageJson.version}`
    );
    allVersionsMatch = false;
  }
}

if (allVersionsMatch) {
  console.log(
    `All package versions match the expected version: ${expectedVersion}`
  );
  process.exit(0);
} else {
  console.error(
    "Version check failed. Please ensure all package.json files have the same version."
  );
  process.exit(1);
}
