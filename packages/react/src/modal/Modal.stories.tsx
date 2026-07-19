import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { Select } from "../select";
import { Text } from "../text";
import { Modal } from "./Modal";

const meta = {
  title: "React/Modal",
  component: Modal,
  parameters: { layout: "padded" },
};

export default meta;

const frame: CSSProperties = {
  padding: "var(--space-6)",
};

export const Default = {
  render: function DefaultStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={frame}>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal open={open} onOpenChange={setOpen}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Rename project</Modal.Title>
              <Modal.Description>
                This updates the name for everyone with access.
              </Modal.Description>
            </Modal.Header>
            <Modal.Body>
              <Text size="sm">
                Choose a clear name. You can change it again later from project
                settings.
              </Text>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </div>
    );
  },
};

export const Sizes = {
  render: function SizesStory() {
    const [size, setSize] = useState<"sm" | "md" | "lg" | "fullscreen" | null>(
      null,
    );
    return (
      <div style={{ ...frame, display: "flex", gap: "var(--space-3)" }}>
        {(["sm", "md", "lg", "fullscreen"] as const).map((item) => (
          <Button key={item} variant="secondary" onClick={() => setSize(item)}>
            {item}
          </Button>
        ))}
        <Modal
          open={size != null}
          onOpenChange={(next) => !next && setSize(null)}
          size={size ?? "md"}
        >
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>{`Size: ${size}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Text size="sm">Content area for the {size} modal.</Text>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setSize(null)}>Close</Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </div>
    );
  },
};

export const FocusBoundary = {
  render: function FocusBoundaryStory() {
    const [open, setOpen] = useState(true);
    return (
      <div style={frame}>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Outside action
        </Button>
        <Modal open={open} onOpenChange={setOpen}>
          <Modal.Content aria-label="Edit assignment">
            <Modal.Header>
              <Modal.Title>Edit assignment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Select aria-label="Owner" searchable>
                <Select.Trigger placeholder="Choose an owner" />
                <Select.Content>
                  <Select.Item value="ada">Ada</Select.Item>
                  <Select.Item value="grace">Grace</Select.Item>
                </Select.Content>
              </Select>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
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
        <Button onClick={() => setOpen(true)}>Edit profile</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          initialFocusRef={initialFocusRef}
          onEscapeKeyDown={(event) => protect && event.preventDefault()}
          onOverlayClick={(event) => protect && event.preventDefault()}
        >
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Edit profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Input ref={initialFocusRef} defaultValue="Ada Lovelace">
                <Input.Label>Display name</Input.Label>
              </Input>
              <Checkbox
                checked={protect}
                onChange={(event) => setProtect(event.currentTarget.checked)}
              >
                Protect unsaved changes
              </Checkbox>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </div>
    );
  },
};
