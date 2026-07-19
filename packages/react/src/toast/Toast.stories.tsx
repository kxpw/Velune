import type { CSSProperties } from "react";
import { Button } from "../button";
import { toast } from "./toast";
import { ToastProvider } from "./ToastProvider";

const meta = {
  title: "React/Toast",
  component: ToastProvider,
  parameters: {
    layout: "padded",
  },
};

export default meta;

const stackStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-3)",
  padding: "var(--space-6)",
};

export const Default = {
  render: () => (
    <ToastProvider>
      <div style={stackStyle}>
        <Button
          variant="secondary"
          onClick={() => toast.show("Saved to drafts")}
        >
          Default
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.success("Profile updated")}
        >
          Success
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.error({
              title: "Upload failed",
              description: "Please try again in a moment.",
            })
          }
        >
          Error
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.warning("Storage almost full")}
        >
          Warning
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.info("New version available")}
        >
          Info
        </Button>
      </div>
    </ToastProvider>
  ),
};

export const WithAction = {
  render: () => (
    <ToastProvider>
      <div style={stackStyle}>
        <Button
          onClick={() =>
            toast.show({
              title: "File deleted",
              description: "This action can be undone.",
              action: {
                label: "Undo",
                altText: "Undo file deletion",
                onClick: () => toast.success("Restored"),
              },
              duration: 8000,
            })
          }
        >
          Show with action
        </Button>
        <Button variant="ghost" onClick={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </div>
    </ToastProvider>
  ),
};

export const LocalizedAction = {
  render: () => (
    <ToastProvider label="الإشعارات" dismissLabel="إغلاق الإشعار">
      <div style={stackStyle} dir="rtl">
        <Button
          onClick={() =>
            toast.show({
              title: "تم حذف الملف",
              action: {
                label: "تراجع",
                altText: "التراجع عن حذف الملف",
                onClick: () => toast.success("تمت الاستعادة"),
              },
              duration: 0,
            })
          }
        >
          حذف الملف
        </Button>
      </div>
    </ToastProvider>
  ),
};

export const BottomLeft = {
  render: () => (
    <ToastProvider position="bottom-left">
      <div style={stackStyle}>
        <Button onClick={() => toast.info("Pinned to bottom-left")}>
          Notify
        </Button>
      </div>
    </ToastProvider>
  ),
};

export const QueueLifecycle = {
  render: () => (
    <ToastProvider
      max={2}
      duration={2000}
      label="Sync notifications"
      swipeDirection="right"
    >
      <div style={stackStyle}>
        <Button
          variant="secondary"
          onClick={() => toast.info({ id: "sync", title: "Syncing changes" })}
        >
          Start sync
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.success({ id: "sync", title: "Changes synced" })}
        >
          Complete sync
        </Button>
        <Button
          onClick={() => {
            toast.show({ id: "queue-a", title: "Queued A", duration: 0 });
            toast.show({ id: "queue-b", title: "Queued B", duration: 0 });
            toast.show({ id: "queue-c", title: "Queued C", duration: 0 });
          }}
        >
          Add burst
        </Button>
      </div>
    </ToastProvider>
  ),
};
