import { useEffect, useMemo, useRef, useState } from "react";
import { Blocks, CornerDownLeft, FileText, Search } from "lucide-react";
import { Box, Flex, Modal, Text } from "velune/react";
import { filterSearchEntries, type SearchEntry } from "./search";

const LISTBOX_ID = "docs-command-palette-listbox";

function optionId(index: number) {
  return `docs-command-palette-option-${index}`;
}

export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (entry: SearchEntry) => void;
};

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const results = useMemo(() => filterSearchEntries(query), [query]);
  const currentIndex = Math.min(activeIndex, Math.max(results.length - 1, 0));

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document
      .getElementById(optionId(currentIndex))
      ?.scrollIntoView?.({ block: "nearest" });
  }, [currentIndex, open]);

  const select = (entry: SearchEntry) => {
    onOpenChange(false);
    onNavigate(entry);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(Math.min(currentIndex + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(Math.max(currentIndex - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(results.length - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const entry = results[currentIndex];
      if (entry) select(entry);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      initialFocusRef={inputRef}
      className="[&_.gs-modal-overlay]:sm:items-start [&_.gs-modal-overlay]:sm:pt-[12vh]"
    >
      <Modal.Content
        aria-label="Search documentation"
        className="!p-gs-0 sm:!max-h-[min(560px,calc(100dvh-var(--space-8)))]"
      >
        <Flex
          align="center"
          gap="2"
          className="flex-none border-b border-gs-border-default px-gs-4"
        >
          <Search
            size={16}
            className="flex-none text-gs-text-secondary"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={LISTBOX_ID}
            aria-autocomplete="list"
            aria-activedescendant={
              results.length ? optionId(currentIndex) : undefined
            }
            aria-label="Search components and pages"
            placeholder="Search components and pages"
            autoComplete="off"
            spellCheck={false}
            className="h-13 w-full min-w-gs-0 flex-1 border-0 bg-transparent font-gs-sans text-gs-sm text-gs-text outline-none placeholder:text-gs-text-secondary"
            value={query}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <Text
            as="kbd"
            family="mono"
            size="2xs"
            tone="muted"
            className="flex-none rounded-gs-xs border border-gs-border-default px-gs-1.5 py-gs-0.5"
          >
            Esc
          </Text>
        </Flex>
        <Box
          role="listbox"
          id={LISTBOX_ID}
          aria-label="Search results"
          className="min-h-gs-0 flex-1 overflow-y-auto p-gs-1"
        >
          {results.length ? (
            results.map((entry, index) => (
              <Box
                key={entry.id}
                role="option"
                id={optionId(index)}
                aria-selected={index === currentIndex}
                className={`flex cursor-pointer items-center gap-gs-3 rounded-gs-sm px-gs-3 py-gs-2 ${
                  index === currentIndex
                    ? "bg-gs-surface-mist text-gs-text"
                    : "text-gs-text-secondary"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(entry)}
              >
                {entry.kind === "component" ? (
                  <Blocks size={15} className="flex-none" aria-hidden="true" />
                ) : (
                  <FileText
                    size={15}
                    className="flex-none"
                    aria-hidden="true"
                  />
                )}
                <Box className="min-w-gs-0 flex-1">
                  <Text as="p" size="sm" weight="medium" truncate>
                    {entry.title}
                  </Text>
                  <Text as="p" size="xs" tone="muted" truncate>
                    {entry.description}
                  </Text>
                </Box>
                <Text
                  size="2xs"
                  tone="muted"
                  className="flex-none uppercase tracking-wide"
                >
                  {entry.hint}
                </Text>
                {index === currentIndex ? (
                  <CornerDownLeft
                    size={14}
                    className="flex-none text-gs-text-secondary"
                    aria-hidden="true"
                  />
                ) : null}
              </Box>
            ))
          ) : (
            <Box role="status" className="px-gs-3 py-gs-6 text-center">
              <Text as="p" size="sm" tone="muted">
                No results for “{query.trim()}”.
              </Text>
            </Box>
          )}
        </Box>
        <Flex
          align="center"
          gap="4"
          className="flex-none border-t border-gs-border-default px-gs-4 py-gs-2"
        >
          <Text size="2xs" tone="muted">
            ↑↓ Navigate
          </Text>
          <Text size="2xs" tone="muted">
            ↵ Open
          </Text>
          <Text size="2xs" tone="muted">
            Esc Close
          </Text>
        </Flex>
      </Modal.Content>
    </Modal>
  );
}
