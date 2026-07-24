import { AspectRatio } from "./AspectRatio";

const meta = {
  title: "React/AspectRatio",
  component: AspectRatio,
};

export default meta;

export const Default = {
  render: () => (
    <AspectRatio
      ratio="16/9"
      className="max-w-md rounded-gs-sm bg-gs-surface-mist"
    >
      <div className="flex items-center justify-center text-gs-sm text-gs-text-secondary">
        16:9
      </div>
    </AspectRatio>
  ),
};
