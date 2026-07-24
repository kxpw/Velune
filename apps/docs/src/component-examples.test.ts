import path from "node:path";
import fs from "node:fs";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { components } from "./component-data";
import {
  documentedComponentSlugs,
  getComponentExamples,
} from "./component-examples";

const docsRoot = path.resolve(import.meta.dirname, "..");

function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (!diagnostic.file || diagnostic.start === undefined) return message;
  const position = diagnostic.file.getLineAndCharacterOfPosition(
    diagnostic.start,
  );
  return `${path.basename(diagnostic.file.fileName)}:${position.line + 1}:${
    position.character + 1
  } ${message}`;
}

describe("component examples", () => {
  it("documents every registered component", () => {
    expect(new Set(documentedComponentSlugs)).toEqual(
      new Set(components.map((component) => component.slug)),
    );
  });

  it("has a matching ComponentPreview case for every example id", () => {
    const previewSource = fs.readFileSync(
      path.join(docsRoot, "src", "ComponentPreview.tsx"),
      "utf8",
    );
    const caseKeys = new Set(
      [...previewSource.matchAll(/case\s+"([^"]+:[^"]+)"/g)].map(
        (match) => match[1],
      ),
    );

    const missing = components.flatMap((component) =>
      getComponentExamples(component)
        .map((example) => `${component.slug}:${example.id}`)
        .filter((key) => !caseKeys.has(key)),
    );

    expect(missing).toEqual([]);
  });

  it(
    "renders every example as a complete TypeScript component",
    () => {
      const configPath = ts.findConfigFile(docsRoot, ts.sys.fileExists);
      expect(configPath).toBeTruthy();
      const configFile = ts.readConfigFile(configPath!, ts.sys.readFile);
      const parsedConfig = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        docsRoot,
      );
      const sources = new Map<string, string>();

      components.forEach((component) => {
        getComponentExamples(component).forEach((example) => {
          const filename = path.join(
            docsRoot,
            "src",
            "__component_examples__",
            `${component.slug}-${example.id}.tsx`,
          );
          sources.set(filename, example.code);
          expect(example.code).toContain("export function ");
        });
      });

      const host: ts.LanguageServiceHost = {
        getCompilationSettings: () => parsedConfig.options,
        getScriptFileNames: () => [...sources.keys()],
        getScriptVersion: () => "1",
        getScriptSnapshot: (filename) => {
          const source = sources.get(filename) ?? ts.sys.readFile(filename);
          return source === undefined
            ? undefined
            : ts.ScriptSnapshot.fromString(source);
        },
        getCurrentDirectory: () => docsRoot,
        getDefaultLibFileName: ts.getDefaultLibFilePath,
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory,
        directoryExists: ts.sys.directoryExists,
        getDirectories: ts.sys.getDirectories,
      };
      const languageService = ts.createLanguageService(host);
      const diagnostics = [...sources.keys()].flatMap((filename) => [
        ...languageService.getSyntacticDiagnostics(filename),
        ...languageService.getSemanticDiagnostics(filename),
      ]);

      expect(diagnostics.map(formatDiagnostic)).toEqual([]);
    },
    15_000,
  );
});
