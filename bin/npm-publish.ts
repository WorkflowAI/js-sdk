import argv from 'minimist';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const semverRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

try {
  // @ts-expect-error import.meta is only supported for certain modes
  const __filename = fileURLToPath(import.meta.url);
  const workspaceDir = join(dirname(__filename), '..');

  // We'll tag published package version differently depending on which branch this action is triggered from
  const {
    tag,
    otp,
    package: packageName,
  } = argv(process.argv.slice(2)) as {
    _: string[];
    tag?: string;
    otp?: string;
    package?: string;
  };

  if (!packageName) {
    console.log('Package name is required');
    process.exit(1);
  }
  const rootDir = join(workspaceDir, 'packages', packageName);

  const localPackageSpecs = JSON.parse(
    readFileSync(join(rootDir, 'package.json'), 'utf-8')
  ) as { name: string; version: string };

  if (tag == 'latest' && !semverRegex.test(localPackageSpecs.version)) {
    console.error(
      `Skipping ${localPackageSpecs.name}@${localPackageSpecs.version} because it doesn't look like a valid semver version`
    );
    process.exit(1);
  }

  // Find published package versions
  // const npmViewCmd = spawnSync("npm", [
  //   "view",
  //   localPackageSpecs.name,
  //   "versions",
  //   "dist-tags",
  //   "--json",
  // ]);
  // assert(!npmViewCmd.error, npmViewCmd.error);
  // assert(
  //   !npmViewCmd.stderr.toString(),
  //   `Failed to lookup package on NPM: ${npmViewCmd.stderr.toString()}`
  // );

  // const { versions: npmVersions, "dist-tags": npmTags } = JSON.parse(
  //   npmViewCmd.stdout.toString()
  // ) as { versions: string[]; "dist-tags": Record<string, string> };

  // // Publish only if version doesn't already exist
  // if (!npmVersions.includes(localPackageSpecs.version)) {
  // Version had not been published yet, so do it!
  const npmArgs = [
    'pub',
    '--loglevel=error',
    '--workspace',
    `@workflowai/${packageName}`,
  ];
  if (tag) {
    npmArgs.push(`--tag=${tag}`);
  }
  if (otp) {
    npmArgs.push(`--otp=${otp}`);
  }
  const publishCmd = spawnSync('npm', npmArgs);

  assert(!publishCmd.error, publishCmd.error);
  assert(
    !publishCmd.stderr.toString(),
    `Failed to publish ${localPackageSpecs.name}@${localPackageSpecs.version}: ${publishCmd.stderr.toString()}`
  );

  console.log(
    `Published ${localPackageSpecs.name}@${localPackageSpecs.version} to NPM with tag "${tag}"`
  );
  // TODO: maybe remove the tag update ? For now we just publish the version
  // } else if (npmTags[tag] !== localPackageSpecs.version) {
  //   // Version has been published, so just make sure the correct tag is applied to it, if it's not already
  //   const tagCmd = spawnSync("npm", [
  //     "dist-tag",
  //     `add`,
  //     `${localPackageSpecs.name}@${localPackageSpecs.version}`,
  //     tag,
  //     "--loglevel=error",
  //   ]);

  //   assert(!tagCmd.error, tagCmd.error);
  //   assert(
  //     !tagCmd.stderr.toString(),
  //     `Failed to add tag "${tag}" to ${localPackageSpecs.name}@${localPackageSpecs.version}: ${tagCmd.stderr.toString()}`
  //   );

  //   console.log(
  //     `Added tag "${tag}" to ${localPackageSpecs.name}@${localPackageSpecs.version} on NPM`
  //   );
  // } else {
  //   console.log(
  //     `Version ${localPackageSpecs.name}@${localPackageSpecs.version} already published on NPM with tag "${tag}"`
  //   );
  // }
} catch (error) {
  console.error(error);
  throw error;
}
