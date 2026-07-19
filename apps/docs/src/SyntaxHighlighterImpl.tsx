import { Highlight, themes, type PrismTheme } from "prism-react-renderer";
import { Box } from "velune/react";
import { usePortalTheme } from "./theme-context";
import type { SyntaxHighlighterProps } from "./SyntaxHighlighter";

const syntaxAccentTypes = new Set(["attr-value", "char", "inserted", "string"]);

function createSyntaxTheme(theme: PrismTheme): PrismTheme {
  return {
    ...theme,
    plain: {
      ...theme.plain,
      backgroundColor: "var(--color-surface-mist)",
      color: "var(--color-text-primary)",
    },
    styles: theme.styles.map((rule) =>
      rule.types.some((type) => syntaxAccentTypes.has(type))
        ? {
            ...rule,
            style: {
              ...rule.style,
              color: "var(--color-text-accent)",
            },
          }
        : rule,
    ),
  };
}

const lightSyntaxTheme = createSyntaxTheme(themes.github);
const darkSyntaxTheme = createSyntaxTheme(themes.vsDark);

function useSyntaxTheme(): PrismTheme {
  const { theme } = usePortalTheme();
  return theme === "dark" ? darkSyntaxTheme : lightSyntaxTheme;
}

export function SyntaxHighlighterImpl({
  code,
  language = "tsx",
  className = "",
}: SyntaxHighlighterProps) {
  const syntaxTheme = useSyntaxTheme();

  return (
    <Highlight code={code} language={language} theme={syntaxTheme}>
      {({
        className: prismClassName,
        getLineProps,
        getTokenProps,
        style,
        tokens,
      }) => (
        <Box
          as="pre"
          style={style}
          className={`${prismClassName} m-0 overflow-auto rounded-gs-md border border-gs-default text-sm ${className}`}
        >
          <Box as="code">
            {tokens.map((line, lineIndex) => (
              <Box as="span" key={lineIndex} {...getLineProps({ line })}>
                {line.map((token, tokenIndex) => (
                  <Box
                    as="span"
                    key={tokenIndex}
                    {...getTokenProps({ token })}
                  />
                ))}
                {lineIndex < tokens.length - 1 ? "\n" : null}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Highlight>
  );
}

export function InlineSyntaxHighlighterImpl({
  code,
  language = "tsx",
  className = "",
}: SyntaxHighlighterProps) {
  const syntaxTheme = useSyntaxTheme();

  return (
    <Highlight code={code} language={language} theme={syntaxTheme}>
      {({ getLineProps, getTokenProps, style, tokens }) => (
        <Box
          as="code"
          style={{ color: style.color }}
          className={`font-gs-mono text-sm ${className}`}
        >
          {tokens.map((line, lineIndex) => (
            <Box as="span" key={lineIndex} {...getLineProps({ line })}>
              {line.map((token, tokenIndex) => (
                <Box
                  as="span"
                  key={tokenIndex}
                  {...getTokenProps({ token })}
                />
              ))}
              {lineIndex < tokens.length - 1 ? "\n" : null}
            </Box>
          ))}
        </Box>
      )}
    </Highlight>
  );
}
