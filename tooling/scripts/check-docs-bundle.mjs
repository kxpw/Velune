import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = process.cwd();
const distDir = resolve(root, "apps/docs/dist");
const html = await readFile(resolve(distDir, "index.html"), "utf8");
const assetPaths = [
  ...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+\.js)"/g),
].map((match) => match[1]);
const lazyChunkNames = ["ComponentPreview", "DocsPages", "syntax"];
const eagerlyLoadedLazyChunks = assetPaths.filter((path) =>
  lazyChunkNames.some((name) => path.includes(`/${name}-`)),
);

if (eagerlyLoadedLazyChunks.length > 0) {
  throw new Error(
    `Docs lazy chunks were eagerly loaded: ${eagerlyLoadedLazyChunks.join(", ")}`,
  );
}

const uniqueAssetPaths = [...new Set(assetPaths)];
const assets = await Promise.all(
  uniqueAssetPaths.map(async (assetPath) => {
    const file = await readFile(resolve(distDir, assetPath.replace(/^\//, "")));
    return {
      path: assetPath,
      gzipBytes: gzipSync(file).byteLength,
    };
  }),
);
const totalGzipBytes = assets.reduce(
  (total, asset) => total + asset.gzipBytes,
  0,
);
const limitBytes = 170 * 1024;

for (const asset of assets) {
  console.log(`${asset.path}: ${(asset.gzipBytes / 1024).toFixed(2)} kB gzip`);
}
console.log(`Docs initial JS: ${(totalGzipBytes / 1024).toFixed(2)} kB gzip`);

if (totalGzipBytes > limitBytes) {
  throw new Error(
    `Docs initial JS exceeds 170 kB gzip (${(totalGzipBytes / 1024).toFixed(2)} kB).`,
  );
}
