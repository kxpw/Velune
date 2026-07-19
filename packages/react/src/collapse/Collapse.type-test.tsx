import { Collapse } from "./Collapse";

<Collapse
  type="single"
  orientation="horizontal"
  dir="rtl"
  value="details"
  onValueChange={(value) => value.toUpperCase()}
/>;

<Collapse
  type="multiple"
  value={["details"]}
  onValueChange={(values) => values.map((value) => value.toUpperCase())}
/>;

// @ts-expect-error single mode accepts one value
<Collapse type="single" value={["details"]} />;

// @ts-expect-error multiple mode accepts an array
<Collapse type="multiple" value="details" />;

// @ts-expect-error multiple mode is always collapsible per item
<Collapse type="multiple" collapsible />;
