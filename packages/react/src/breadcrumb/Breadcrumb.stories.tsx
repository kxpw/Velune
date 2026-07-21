import { Breadcrumb } from "./Breadcrumb";

const meta = {
  title: "React/Breadcrumb",
  component: Breadcrumb,
};

export default meta;

export const Default = {
  render: () => (
    <Breadcrumb>
      <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
      <Breadcrumb.Item href="#">Workspace</Breadcrumb.Item>
      <Breadcrumb.Item href="#">Projects</Breadcrumb.Item>
      <Breadcrumb.Item>Velune design system</Breadcrumb.Item>
    </Breadcrumb>
  ),
};

export const CustomSeparator = {
  render: () => (
    <Breadcrumb separator="/">
      <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
      <Breadcrumb.Item href="#">Settings</Breadcrumb.Item>
      <Breadcrumb.Item>Notifications</Breadcrumb.Item>
    </Breadcrumb>
  ),
};

export const WithoutLinks = {
  render: () => (
    <Breadcrumb>
      <Breadcrumb.Item>Wizard</Breadcrumb.Item>
      <Breadcrumb.Item>Billing details</Breadcrumb.Item>
      <Breadcrumb.Item>Confirmation</Breadcrumb.Item>
    </Breadcrumb>
  ),
};
