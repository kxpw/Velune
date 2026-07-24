import { Empty } from "./Empty";
import { Button } from "../button";

const meta = {
  title: "React/Empty",
  component: Empty,
};

export default meta;

export const Default = {
  render: () => (
    <Empty>
      <Empty.Title>No projects yet</Empty.Title>
      <Empty.Description>
        Create your first project to start organizing work.
      </Empty.Description>
      <Empty.Action>
        <Button>Create project</Button>
      </Empty.Action>
    </Empty>
  ),
};
