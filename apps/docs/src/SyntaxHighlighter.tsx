import { lazy, Suspense } from "react";
import { Box } from "velune/react";

export type CodeLanguage = "bash" | "css" | "tsx";

export interface SyntaxHighlighterProps {
  code: string;
  language?: CodeLanguage;
  className?: string;
}

const LazySyntaxHighlighter = lazy(() =>
  import("./SyntaxHighlighterImpl").then(({ SyntaxHighlighterImpl }) => ({
    default: SyntaxHighlighterImpl,
  })),
);

const LazyInlineSyntaxHighlighter = lazy(() =>
  import("./SyntaxHighlighterImpl").then(
    ({ InlineSyntaxHighlighterImpl }) => ({
      default: InlineSyntaxHighlighterImpl,
    }),
  ),
);

export function SyntaxHighlighter({
  code,
  language = "tsx",
  className = "",
}: SyntaxHighlighterProps) {
  return (
    <Suspense
      fallback={
        <Box
          as="pre"
          className={`m-0 overflow-auto rounded-gs-md border border-gs-default bg-gs-surface-mist text-sm ${className}`}
        >
          <Box as="code">{code}</Box>
        </Box>
      }
    >
      <LazySyntaxHighlighter
        code={code}
        language={language}
        className={className}
      />
    </Suspense>
  );
}

export function InlineSyntaxHighlighter({
  code,
  language = "tsx",
  className = "",
}: SyntaxHighlighterProps) {
  return (
    <Suspense
      fallback={
        <Box as="code" className={`font-gs-mono text-sm ${className}`}>
          {code}
        </Box>
      }
    >
      <LazyInlineSyntaxHighlighter
        code={code}
        language={language}
        className={className}
      />
    </Suspense>
  );
}
