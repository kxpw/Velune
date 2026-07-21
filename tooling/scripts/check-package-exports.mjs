import { access, readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const packageDirs = await readdir(join(root, "packages"), {
  withFileTypes: true,
});
const failures = [];

for (const entry of packageDirs) {
  if (!entry.isDirectory()) continue;

  const packageDir = join(root, "packages", entry.name);
  const manifestPath = join(packageDir, "package.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  for (const target of collectTargets(manifest.exports)) {
    if (target.includes("*")) {
      const matches = await findPatternMatches(packageDir, target);
      if (matches.length === 0) {
        failures.push(
          `${relative(root, manifestPath)} pattern ${target} matches no files`,
        );
      }
      continue;
    }

    const targetPath = join(packageDir, target);
    try {
      await access(targetPath);
    } catch {
      failures.push(
        `${relative(root, manifestPath)} points to missing ${relative(root, targetPath)}`,
      );
    }
  }
}

await checkReactComponentExportCoverage();
const aggregateReactExportCount = await checkAggregateReactExportCoverage();

if (failures.length > 0) {
  throw new Error(`Package export checks failed:\n${failures.join("\n")}`);
}

console.log(
  `All package export targets exist (${aggregateReactExportCount} aggregate React subpaths).`,
);

function collectTargets(value) {
  if (typeof value === "string") {
    return value.startsWith("./") ? [value] : [];
  }
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(collectTargets);
}

async function findPatternMatches(packageDir, target) {
  const normalizedTarget = target.slice(2);
  const searchRoot = normalizedTarget.slice(0, normalizedTarget.indexOf("*"));
  const baseDir = join(packageDir, searchRoot.replace(/[^/]*$/, ""));
  const pattern = new RegExp(
    `^${escapeRegExp(normalizedTarget).replaceAll("\\*", ".+")}$`,
  );
  const files = await listFiles(baseDir, packageDir);
  return files.filter((file) => pattern.test(file));
}

async function listFiles(directory, packageDir) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? listFiles(path, packageDir)
        : [relative(packageDir, path)];
    }),
  );
  return files.flat();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function checkReactComponentExportCoverage() {
  const reactDir = join(root, "packages/react");
  const manifestPath = join(reactDir, "package.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const sourceEntries = await readdir(join(reactDir, "src"), {
    withFileTypes: true,
  });

  for (const entry of sourceEntries) {
    if (!entry.isDirectory() || entry.name === "shared") continue;

    try {
      await access(join(reactDir, "src", entry.name, "index.ts"));
    } catch {
      continue;
    }

    const subpath = `./${entry.name}`;
    if (!(subpath in manifest.exports)) {
      failures.push(
        `packages/react/src/${entry.name} is missing package export ${subpath}`,
      );
    }
  }
}

async function checkAggregateReactExportCoverage() {
  const reactDir = join(root, "packages/react");
  const aggregateDir = join(root, "packages/velune");
  const reactManifest = JSON.parse(
    await readFile(join(reactDir, "package.json"), "utf8"),
  );
  const aggregateManifest = JSON.parse(
    await readFile(join(aggregateDir, "package.json"), "utf8"),
  );
  const sourceEntries = await readdir(join(reactDir, "src"), {
    withFileTypes: true,
  });
  let checkedSubpaths = 0;

  for (const entry of sourceEntries) {
    if (!entry.isDirectory() || entry.name === "shared") continue;

    try {
      await access(join(reactDir, "src", entry.name, "index.ts"));
    } catch {
      continue;
    }

    const componentTargetPrefix = `./dist/${entry.name}/index.`;
    const reactExport = Object.entries(reactManifest.exports).find(
      ([subpath, value]) =>
        /^\.\/[^/]+$/.test(subpath) &&
        collectTargets(value).some((target) =>
          target.startsWith(componentTargetPrefix),
        ),
    );

    if (!reactExport) {
      failures.push(
        `packages/react/src/${entry.name} has no resolvable public subpath`,
      );
      continue;
    }

    const publicName = reactExport[0].slice(2);
    const aggregateSubpath = `./react/${publicName}`;
    const aggregateTargets = resolveExportTargets(
      aggregateManifest.exports,
      aggregateSubpath,
    );

    if (aggregateTargets.length === 0) {
      failures.push(
        `packages/velune/package.json cannot resolve ${aggregateSubpath}`,
      );
      continue;
    }

    for (const target of aggregateTargets) {
      try {
        await access(join(aggregateDir, target));
      } catch {
        failures.push(
          `packages/velune/package.json maps ${aggregateSubpath} to missing ${target}`,
        );
      }
    }
    checkedSubpaths += 1;
  }

  const requiredPackageFiles = ["dist", "LICENSE", "README.md"];
  for (const file of requiredPackageFiles) {
    if (!aggregateManifest.files?.includes(file)) {
      failures.push(`packages/velune/package.json files must include ${file}`);
    }
  }

  return checkedSubpaths;
}

function resolveExportTargets(exportsMap, requestedSubpath) {
  if (!exportsMap || typeof exportsMap !== "object") return [];
  if (requestedSubpath in exportsMap) {
    return collectTargets(exportsMap[requestedSubpath]);
  }

  for (const [pattern, value] of Object.entries(exportsMap)) {
    const starIndex = pattern.indexOf("*");
    if (starIndex === -1) continue;
    const prefix = pattern.slice(0, starIndex);
    const suffix = pattern.slice(starIndex + 1);
    if (
      !requestedSubpath.startsWith(prefix) ||
      !requestedSubpath.endsWith(suffix)
    ) {
      continue;
    }
    const match = requestedSubpath.slice(
      prefix.length,
      requestedSubpath.length - suffix.length,
    );
    return collectTargets(value).map((target) => target.replaceAll("*", match));
  }

  return [];
}
