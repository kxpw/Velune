import { createRef } from "react";
import { Box } from "../box";
import { Card } from "../card";
import { Container } from "../container";
import { Drawer } from "../drawer";
import { Flex } from "../flex";
import { Grid } from "../grid";
import { Modal } from "../modal";
import { ReliefCard } from "../relief-card";
import { Stack } from "../stack";
import { Text } from "../text";

const anchorRef = createRef<HTMLAnchorElement>();
const labelRef = createRef<HTMLLabelElement>();
const headingRef = createRef<HTMLHeadingElement>();

<Box as="a" href="/docs" ref={anchorRef} />;
<Container as="a" href="/docs" ref={anchorRef} />;
<Flex as="a" href="/docs" ref={anchorRef} />;
<Grid as="a" href="/docs" ref={anchorRef} />;
<Stack as="a" href="/docs" ref={anchorRef} />;
<Text as="label" htmlFor="email" ref={labelRef} />;
<Card as="a" href="/project" ref={anchorRef} />;
<Card.Title as="h1" ref={headingRef} />;
<ReliefCard.Title as="h1" ref={headingRef} />;
<Modal.Title as="h1" ref={headingRef} />;
<Drawer.Title as="h1" ref={headingRef} />;

// @ts-expect-error A div does not accept anchor-only attributes.
<Box href="/docs" />;
// @ts-expect-error The ref must match the rendered element.
<Text as="label" ref={anchorRef} />;
