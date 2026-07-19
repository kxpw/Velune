import { createRef } from "react";
import { Radio } from "./Radio";

const groupRef = createRef<HTMLDivElement>();
const inputRef = createRef<HTMLInputElement>();

<Radio.Group
  ref={groupRef}
  aria-label="Plans"
  data-testid="plans"
  onKeyDown={(event) => event.preventDefault()}
>
  <Radio ref={inputRef} value="pro">
    Pro
  </Radio>
</Radio.Group>;

// @ts-expect-error Radio.Group is a div and does not accept anchor attributes.
<Radio.Group href="/plans" />;
