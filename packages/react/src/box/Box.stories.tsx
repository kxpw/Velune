import { Box } from "./Box";

const meta = {
  title: "React/Box",
  component: Box,
};

export default meta;

export const Default = {
  render: () => <Box padding="4">Box</Box>,
};

export const Responsive = {
  render: () => (
    <Box
      padding={{ base: "3", md: "6" }}
      display={{ base: "block", md: "grid" }}
    >
      Responsive box
    </Box>
  ),
};
