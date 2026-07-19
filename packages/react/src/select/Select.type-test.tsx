import { Select } from "./Select";

const content = (
  <>
    <Select.Trigger />
    <Select.Content>
      <Select.Item value="ready">Ready</Select.Item>
    </Select.Content>
  </>
);

<Select value="ready" onValueChange={(value) => value.toUpperCase()}>
  {content}
</Select>;

<Select
  multiple
  value={["ready"]}
  onValueChange={(values) => values.map((value) => value.toUpperCase())}
>
  {content}
</Select>;

// @ts-expect-error single Select accepts one value
<Select value={["ready"]}>{content}</Select>;

// @ts-expect-error multiple Select accepts an array
<Select multiple value="ready">
  {content}
</Select>;
