export type ComponentRegistration = {
  slug: string;
  componentName: string;
  publicSubpath: string;
};

type PackageManifest = {
  exports?: Record<string, unknown>;
  [key: string]: unknown;
};

export function registerRootExport(
  source: string,
  registration: ComponentRegistration,
) {
  if (source.includes(`from "./${registration.slug}"`)) {
    return source;
  }

  return `${source.trimEnd()}\nexport { ${registration.componentName} } from "./${registration.slug}";
export type { ${registration.componentName}Props } from "./${registration.slug}";
`;
}

export function registerBuildEntry(
  source: string,
  registration: ComponentRegistration,
) {
  const entry = `src/${registration.slug}/index.ts`;
  if (source.includes(`"${entry}"`)) {
    return source;
  }

  const entryStart = source.indexOf("entry: [");
  const entryEnd = source.indexOf("  ],", entryStart);
  if (entryStart === -1 || entryEnd === -1) {
    throw new Error("Could not find the tsup entry array.");
  }

  return `${source.slice(0, entryEnd)}    "${entry}",\n${source.slice(entryEnd)}`;
}

export function registerPackageExport(
  manifest: PackageManifest,
  subpath: string,
  targetDirectory: string,
  beforeSubpath: string,
) {
  const currentExports = manifest.exports ?? {};
  if (subpath in currentExports) {
    return manifest;
  }

  const entry = {
    types: `./${targetDirectory}/index.d.ts`,
    import: `./${targetDirectory}/index.mjs`,
    require: `./${targetDirectory}/index.cjs`,
  };
  const nextExports: Record<string, unknown> = {};
  let inserted = false;

  for (const [key, value] of Object.entries(currentExports)) {
    if (!inserted && key === beforeSubpath) {
      nextExports[subpath] = entry;
      inserted = true;
    }
    nextExports[key] = value;
  }

  if (!inserted) {
    nextExports[subpath] = entry;
  }

  return { ...manifest, exports: nextExports };
}
