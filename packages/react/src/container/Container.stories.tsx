import { Container } from "./Container";

const meta = {
  title: "React/Container",
  component: Container,
};

export default meta;

export const Default = {
  render: () => <Container>Container</Container>,
};

export const Responsive = {
  render: () => (
    <Container size={{ base: "sm", lg: "xl" }}>Container</Container>
  ),
};
