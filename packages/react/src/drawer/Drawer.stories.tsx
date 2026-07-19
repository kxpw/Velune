import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { Text } from "../text";
import { Drawer } from "./Drawer";
import type { DrawerPlacement } from "./Drawer.types";

const meta = {
  title: "React/Drawer",
  component: Drawer,
  parameters: { layout: "padded" },
};

export default meta;

const frame: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-3)",
  padding: "var(--space-6)",
};

export const Default = {
  render: function DefaultStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={frame}>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer open={open} onOpenChange={setOpen} placement="right">
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Filters</Drawer.Title>
              <Drawer.Description>Refine the current view</Drawer.Description>
            </Drawer.Header>
            <Drawer.Body>
              <Text size="sm">
                Drawer panels slide in from an edge and share Modal focus
                trapping, Escape, and overlay dismiss behavior.
              </Text>
            </Drawer.Body>
            <Drawer.Footer>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Reset
              </Button>
              <Button onClick={() => setOpen(false)}>Apply</Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </div>
    );
  },
};

export const Placements = {
  render: function PlacementsStory() {
    const [placement, setPlacement] = useState<DrawerPlacement | null>(null);
    return (
      <div style={frame}>
        {(["left", "right", "top", "bottom"] as const).map((item) => (
          <Button
            key={item}
            variant="secondary"
            onClick={() => setPlacement(item)}
          >
            {item}
          </Button>
        ))}
        <Drawer
          open={placement != null}
          onOpenChange={(next) => !next && setPlacement(null)}
          placement={placement ?? "right"}
        >
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>{`Placement: ${placement}`}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Text size="sm">Content for the {placement} drawer.</Text>
            </Drawer.Body>
            <Drawer.Footer>
              <Button onClick={() => setPlacement(null)}>Close</Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </div>
    );
  },
};

export const CancellableDismiss = {
  render: function CancellableDismissStory() {
    const [open, setOpen] = useState(false);
    const [protect, setProtect] = useState(true);
    const initialFocusRef = useRef<HTMLInputElement>(null);
    return (
      <div style={frame}>
        <Button onClick={() => setOpen(true)}>Edit filters</Button>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          placement="right"
          initialFocusRef={initialFocusRef}
          onEscapeKeyDown={(event) => protect && event.preventDefault()}
          onOverlayClick={(event) => protect && event.preventDefault()}
        >
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Edit filters</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Input ref={initialFocusRef} defaultValue="Ada">
                <Input.Label>Owner</Input.Label>
              </Input>
              <Checkbox
                checked={protect}
                onChange={(event) => setProtect(event.currentTarget.checked)}
              >
                Protect filter changes
              </Checkbox>
            </Drawer.Body>
            <Drawer.Footer>
              <Button onClick={() => setOpen(false)}>Apply</Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </div>
    );
  },
};
