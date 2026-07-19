export type ApiProp = {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string | undefined;
  description?: string | undefined;
};

export type ApiPropGroup = {
  name: string;
  inheritance?: string | undefined;
  props: ApiProp[];
};

export type ApiTypeAlias = {
  name: string;
  value: string;
};

export type ComponentApiReference = {
  groups: ApiPropGroup[];
  aliases: ApiTypeAlias[];
};

const typeSources = import.meta.glob(
  "../../../packages/react/src/*/*.types.ts",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

function getSourceBySlug(slug: string) {
  const suffix = `/src/${slug}/`;
  return Object.entries(typeSources).find(([path]) =>
    path.includes(suffix),
  )?.[1];
}

function readBalancedBlock(source: string, openIndex: number) {
  let depth = 0;
  let quote = "";
  let escaped = false;

  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        return {
          body: source.slice(openIndex + 1, index),
          end: index + 1,
        };
      }
    }
  }
  return null;
}

function splitProperties(body: string) {
  const segments: string[] = [];
  let start = 0;
  let braces = 0;
  let brackets = 0;
  let parentheses = 0;
  let quote = "";
  let escaped = false;

  for (let index = 0; index < body.length; index += 1) {
    const character = body[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") braces += 1;
    if (character === "}") braces -= 1;
    if (character === "[") brackets += 1;
    if (character === "]") brackets -= 1;
    if (character === "(") parentheses += 1;
    if (character === ")") parentheses -= 1;
    if (
      character === ";" &&
      braces === 0 &&
      brackets === 0 &&
      parentheses === 0
    ) {
      segments.push(body.slice(start, index).trim());
      start = index + 1;
    }
  }
  const tail = body.slice(start).trim();
  if (tail) segments.push(tail);
  return segments.filter(Boolean);
}

function cleanComment(comment?: string) {
  if (!comment) return undefined;
  return comment
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter(Boolean)
    .join(" ")
    .replaceAll("`", "");
}

function readDefaultValue(comment?: string) {
  if (!comment) return undefined;
  const backtick = comment.match(/Default(?::)?\s+`([^`]+)`/i);
  if (backtick) return backtick[1];
  const quoted = comment.match(/Default(?::)?\s+["']([^"']+)["']/i);
  if (quoted) return quoted[1];
  const plain = comment.match(/Default(?::)?\s+([^.!?]+)/i);
  return plain?.[1]?.trim();
}

function parseProperty(segment: string): ApiProp | null {
  const match = segment.match(
    /^(?:\/\*\*([\s\S]*?)\*\/\s*)?(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$-]*))(\?)?\s*:\s*([\s\S]+)$/,
  );
  if (!match) return null;
  const comment = cleanComment(match[1]);
  const name = match[2] ?? match[3] ?? match[4];
  const type = match[6];
  if (!name || !type) return null;
  return {
    name,
    required: !match[5],
    type: type.replace(/\s+/g, " ").trim(),
    defaultValue: readDefaultValue(comment),
    description: comment,
  };
}

function findAliasEnd(source: string, equalsIndex: number) {
  let braces = 0;
  let brackets = 0;
  let parentheses = 0;
  let quote = "";
  let escaped = false;
  for (let index = equalsIndex + 1; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") braces += 1;
    if (character === "}") braces -= 1;
    if (character === "[") brackets += 1;
    if (character === "]") brackets -= 1;
    if (character === "(") parentheses += 1;
    if (character === ")") parentheses -= 1;
    if (
      character === ";" &&
      braces === 0 &&
      brackets === 0 &&
      parentheses === 0
    ) {
      return index;
    }
  }
  return -1;
}

function findAliasEquals(source: string, declarationEnd: number) {
  let angleBrackets = 0;
  let quote = "";
  let escaped = false;
  for (let index = declarationEnd; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "<") angleBrackets += 1;
    else if (character === ">") angleBrackets = Math.max(0, angleBrackets - 1);
    else if (character === "=" && angleBrackets === 0) return index;
    else if (character === ";" && angleBrackets === 0) return -1;
  }
  return -1;
}

function readAliasValue(
  source: string,
  equalsIndex: number,
  aliasEnd: number,
) {
  if (aliasEnd < 0) return "";
  return source
    .slice(equalsIndex + 1, aliasEnd)
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\|\s*/, "");
}

export function getComponentApiReference(slug: string): ComponentApiReference {
  const source = getSourceBySlug(slug);
  if (!source) return { groups: [], aliases: [] };

  const groups: ApiPropGroup[] = [];
  const aliases: ApiTypeAlias[] = [];
  const declarationPattern = /export\s+(interface|type)\s+([A-Za-z_$][\w$]*)/g;
  let match: RegExpExecArray | null;

  while ((match = declarationPattern.exec(source))) {
    const kind = match[1];
    const name = match[2];
    if (!kind || !name) continue;
    const declarationEnd = match.index + match[0].length;

    if (kind === "interface") {
      const openIndex = source.indexOf("{", declarationEnd);
      if (openIndex < 0) continue;
      const block = readBalancedBlock(source, openIndex);
      if (!block) continue;
      const props = splitProperties(block.body)
        .map(parseProperty)
        .filter((prop): prop is ApiProp => prop !== null);
      if (props.length) {
        const header = source
          .slice(declarationEnd, openIndex)
          .replace(/\s+/g, " ")
          .trim();
        groups.push({
          name,
          inheritance: header || undefined,
          props,
        });
      }
      declarationPattern.lastIndex = block.end;
      continue;
    }

    const equalsIndex = findAliasEquals(source, declarationEnd);
    if (equalsIndex < 0) continue;
    const aliasEnd = findAliasEnd(source, equalsIndex);
    if (aliasEnd < 0) continue;
    const firstValueIndex: number = source.slice(equalsIndex + 1).search(/\S/);
    const valueStart =
      firstValueIndex < 0 ? equalsIndex + 1 : equalsIndex + 1 + firstValueIndex;
    if (source[valueStart] === "{") {
      const block = readBalancedBlock(source, valueStart);
      if (!block) continue;
      const props = splitProperties(block.body)
        .map(parseProperty)
        .filter((prop): prop is ApiProp => prop !== null);
      if (props.length) groups.push({ name, props });
      declarationPattern.lastIndex = block.end;
      continue;
    }

    const intersectionObjectIndex = source.indexOf("{", valueStart);
    if (
      intersectionObjectIndex >= 0 &&
      intersectionObjectIndex < aliasEnd
    ) {
      const prefix = source.slice(valueStart, intersectionObjectIndex);
      if (prefix.includes("&")) {
        const block = readBalancedBlock(source, intersectionObjectIndex);
        if (block) {
          const props = splitProperties(block.body)
            .map(parseProperty)
            .filter((prop): prop is ApiProp => prop !== null);
          if (props.length) {
            groups.push({
              name,
              inheritance: prefix.replace(/\s+/g, " ").trim(),
              props,
            });
          }
          declarationPattern.lastIndex = block.end;
          continue;
        }
      }
    }

    const value = readAliasValue(source, equalsIndex, aliasEnd);
    const polymorphicMatch = value.match(
      /^PolymorphicProps<[^,]+,\s*([A-Za-z_$][\w$]*)\s*>$/,
    );
    const ownPropsName = polymorphicMatch?.[1];
    if (ownPropsName) {
      const ownPropsIndex = groups.findIndex(
        (group) => group.name === ownPropsName,
      );
      const ownProps = groups[ownPropsIndex];
      if (ownProps) {
        groups.splice(ownPropsIndex, 1);
        groups.push({
          name,
          inheritance: value,
          props: ownProps.props,
        });
        continue;
      }
    }
    if (value && value.length <= 360) aliases.push({ name, value });
  }

  return { groups, aliases };
}
