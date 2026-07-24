import { ScrollArea } from "./ScrollArea";

const meta = {
  title: "React/ScrollArea",
  component: ScrollArea,
};

export default meta;

export const Default = {
  render: () => (
    <ScrollArea
      maxHeight={160}
      className="w-64 rounded-gs-sm border border-gs-border-default p-gs-3"
      aria-label="Long content"
    >
      {Array.from({ length: 20 }, (_, index) => (
        <p key={index} className="m-gs-0 py-gs-1 text-gs-sm text-gs-text">
          Scrollable row {index + 1}
        </p>
      ))}
    </ScrollArea>
  ),
};
