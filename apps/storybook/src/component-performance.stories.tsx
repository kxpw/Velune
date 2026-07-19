import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReliefCard,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Collapse,
  Container,
  DatePicker,
  Divider,
  Drawer,
  Flex,
  Form,
  Grid,
  Input,
  List,
  Modal,
  Pagination,
  Popover,
  Progress,
  Radio,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Switch,
  Table,
  Tabs,
  Tag,
  Text,
  TextArea,
  toast,
  ToastProvider,
  Tooltip,
  VirtualTable,
  Wizard,
} from "velune/react";

const meta = {
  title: "Performance/All Components",
  parameters: {
    layout: "centered",
  },
};

export default meta;

declare global {
  interface Window {
    __GS_PERFORMANCE_UPDATE__?: () => void;
  }
}

function PerformanceCase({
  children,
}: {
  children: (iteration: number) => ReactNode;
}) {
  const [iteration, setIteration] = useState(0);
  const [ready, setReady] = useState(false);
  const update = useCallback(() => {
    setIteration((current) => current + 1);
  }, []);

  useEffect(() => {
    window.__GS_PERFORMANCE_UPDATE__ = update;
  }, [update]);

  useEffect(() => {
    let settleFrame = 0;
    const frame = requestAnimationFrame(() => {
      settleFrame = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(settleFrame);
    };
  }, []);

  useEffect(
    () => () => {
      if (window.__GS_PERFORMANCE_UPDATE__ === update) {
        delete window.__GS_PERFORMANCE_UPDATE__;
      }
    },
    [update],
  );

  return (
    <div
      data-performance-ready={ready ? "true" : "false"}
      data-performance-iteration={iteration}
    >
      {children(iteration)}
    </div>
  );
}

function performanceStory(render: (iteration: number) => ReactNode) {
  return {
    render: () => <PerformanceCase>{render}</PerformanceCase>,
  };
}

const tableColumns = [
  { key: "name", title: "Name", dataIndex: "name" },
  { key: "status", title: "Status", dataIndex: "status" },
];

const tableRows = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `Project ${index + 1}`,
  status: index % 2 === 0 ? "Ready" : "Pending",
}));

const virtualTableRows = Array.from({ length: 10_000 }, (_, index) => ({
  id: index + 1,
  name: `Member ${index + 1}`,
  status: index % 2 === 0 ? "Active" : "Invited",
}));

const selectOptions = [
  { label: "Ready", value: "ready" },
  { label: "Pending", value: "pending" },
  { label: "Blocked", value: "blocked" },
];

const largeSelectOptions = Array.from({ length: 250 }, (_, index) => ({
  label: `Option ${index + 1}`,
  value: `option-${index + 1}`,
}));

export const BaselineMount = performanceStory((iteration) => (
  <span>{iteration}</span>
));

export const ReliefCardMount = performanceStory((iteration) => (
  <ReliefCard>
    <ReliefCard.Title>{`Empty state ${iteration}`}</ReliefCard.Title>
    <ReliefCard.Description>Create a project</ReliefCard.Description>
  </ReliefCard>
));

export const AvatarMount = performanceStory((iteration) => (
  <Avatar name={`Ada Lovelace ${iteration}`} />
));

export const BadgeMount = performanceStory((iteration) => (
  <Badge count={iteration + 4}>
    <span>Inbox</span>
  </Badge>
));

export const BoxMount = performanceStory((iteration) => (
  <Box padding="4">Box {iteration}</Box>
));

export const ButtonMount = performanceStory((iteration) => (
  <Button>Continue {iteration}</Button>
));

export const CardMount = performanceStory((iteration) => (
  <Card>
    <Card.Header>
      <Card.Title>{`Project ${iteration}`}</Card.Title>
      <Card.Description>Performance</Card.Description>
    </Card.Header>
    <Card.Body>Card body</Card.Body>
    <Card.Footer>Card footer</Card.Footer>
  </Card>
));

export const CheckboxMount = performanceStory((iteration) => (
  <Checkbox checked={iteration % 2 === 1} readOnly>
    Accept terms
  </Checkbox>
));

export const CollapseMount = performanceStory((iteration) => (
  <Collapse type="single" value={iteration % 2 === 1 ? "second" : "first"}>
    <Collapse.Item value="first">
      <Collapse.Trigger>First</Collapse.Trigger>
      <Collapse.Content>First content</Collapse.Content>
    </Collapse.Item>
    <Collapse.Item value="second">
      <Collapse.Trigger>Second</Collapse.Trigger>
      <Collapse.Content>Second content</Collapse.Content>
    </Collapse.Item>
  </Collapse>
));

export const ContainerMount = performanceStory((iteration) => (
  <Container size="md">Container {iteration}</Container>
));

export const DatePickerMount = performanceStory((iteration) => (
  <DatePicker
    aria-label="Deployment date"
    value={new Date(2026, 6, (iteration % 2) + 1)}
    open
  />
));

export const DividerMount = performanceStory((iteration) => (
  <Divider>{`Section ${iteration}`}</Divider>
));

export const DrawerMount = performanceStory((iteration) => (
  <Drawer open onOpenChange={() => undefined}>
    <Drawer.Content>
      <Drawer.Header>
        <Drawer.Title>{`Filters ${iteration}`}</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>Drawer body</Drawer.Body>
      <Drawer.Footer>Drawer footer</Drawer.Footer>
    </Drawer.Content>
  </Drawer>
));

export const FlexMount = performanceStory((iteration) => (
  <Flex gap="3">
    <span>One</span>
    <span>Two {iteration}</span>
  </Flex>
));

export const FormMount = performanceStory((iteration) => (
  <Form values={{ email: `user${iteration}@example.com` }}>
    <Form.Item name="email" rules={[{ required: true }]}>
      <Input>
        <Input.Label>Email</Input.Label>
      </Input>
    </Form.Item>
    <Button type="submit">Submit</Button>
  </Form>
));

export const GridMount = performanceStory((iteration) => (
  <Grid columns={3} gap="3">
    <span>One</span>
    <span>Two</span>
    <span>Three {iteration}</span>
  </Grid>
));

export const InputMount = performanceStory((iteration) => (
  <Input aria-label="Email" value={`user${iteration}@example.com`} readOnly />
));

export const ListMount = performanceStory((iteration) => (
  <List>
    <List.Item>
      <List.Content>
        <List.Title>Alpha</List.Title>
        <List.Description>First item</List.Description>
      </List.Content>
    </List.Item>
    <List.Item>
      <List.Content>
        <List.Title>{`Beta ${iteration}`}</List.Title>
        <List.Description>Second item</List.Description>
      </List.Content>
    </List.Item>
  </List>
));

export const ModalMount = performanceStory((iteration) => (
  <Modal open onOpenChange={() => undefined}>
    <Modal.Content>
      <Modal.Header>
        <Modal.Title>{`Rename ${iteration}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>Modal body</Modal.Body>
      <Modal.Footer>Modal footer</Modal.Footer>
    </Modal.Content>
  </Modal>
));

export const PaginationMount = performanceStory((iteration) => (
  <Pagination page={iteration + 1} pageSize={20} total={500} />
));

export const PopoverMount = performanceStory((iteration) => (
  <Popover open>
    <Popover.Trigger>
      <Button>Trigger</Button>
    </Popover.Trigger>
    <Popover.Content>
      <span>Popover content {iteration}</span>
    </Popover.Content>
  </Popover>
));

export const ProgressMount = performanceStory((iteration) => (
  <Progress value={40 + iteration} aria-label="Upload progress" />
));

export const RadioMount = performanceStory((iteration) => (
  <Radio.Group value={iteration % 2 === 1 ? "second" : "first"}>
    <Radio.Group.Label>Choice</Radio.Group.Label>
    <Radio value="first">First</Radio>
    <Radio value="second">Second</Radio>
  </Radio.Group>
));

export const SelectMount = performanceStory((iteration) => (
  <Select aria-label="Status" value={iteration % 2 === 1 ? "pending" : "ready"}>
    <Select.Trigger />
    <Select.Content>
      {selectOptions.map((option) => (
        <Select.Item key={option.value} value={option.value}>
          {option.label}
        </Select.Item>
      ))}
    </Select.Content>
  </Select>
));

function LargeSelectScenario({ iteration }: { iteration: number }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current
      ?.querySelector<HTMLButtonElement>("[role=combobox]")
      ?.click();
  }, []);

  return (
    <div ref={rootRef}>
      <Select
        aria-label="Large dataset"
        value={iteration % 2 === 1 ? "option-2" : "option-1"}
        portal={false}
      >
        <Select.Trigger />
        <Select.Content>
          {largeSelectOptions.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
}

export const SelectLargeMount = performanceStory((iteration) => (
  <LargeSelectScenario iteration={iteration} />
));

export const SkeletonMount = performanceStory((iteration) => (
  <Skeleton variant="rounded" width={240 + iteration} height={32} />
));

export const SpinnerMount = performanceStory((iteration) => (
  <Spinner aria-label={`Loading ${iteration}`} />
));

export const StackMount = performanceStory((iteration) => (
  <Stack gap="3">
    <span>One</span>
    <span>Two {iteration}</span>
  </Stack>
));

export const SwitchMount = performanceStory((iteration) => (
  <Switch checked={iteration % 2 === 1} readOnly>
    Notifications
  </Switch>
));

export const TableMount = performanceStory((iteration) => (
  <Table
    aria-label={`Projects ${iteration}`}
    columns={tableColumns}
    dataSource={tableRows}
    rowKey="id"
  />
));

export const TabsMount = performanceStory((iteration) => (
  <Tabs value={iteration % 2 === 1 ? "activity" : "overview"}>
    <Tabs.List>
      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
      <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Panel value="overview">Overview panel</Tabs.Panel>
    <Tabs.Panel value="activity">Activity panel</Tabs.Panel>
  </Tabs>
));

export const TagMount = performanceStory((iteration) => (
  <Tag tone="success">Active {iteration}</Tag>
));

export const TextMount = performanceStory((iteration) => (
  <Text>Performance text {iteration}</Text>
));

export const TextAreaMount = performanceStory((iteration) => (
  <TextArea
    aria-label="Notes"
    value={`Performance notes ${iteration}`}
    readOnly
  />
));

function ToastScenario({ iteration }: { iteration: number }) {
  useEffect(() => {
    const id = toast.show({
      title: `Saved ${iteration}`,
      description: "Performance notification",
      duration: Infinity,
    });
    return () => toast.dismiss(id);
  }, [iteration]);

  return <ToastProvider />;
}

export const ToastMount = performanceStory((iteration) => (
  <ToastScenario iteration={iteration} />
));

export const TooltipMount = performanceStory((iteration) => (
  <Tooltip open>
    <Tooltip.Trigger>
      <Button>Trigger</Button>
    </Tooltip.Trigger>
    <Tooltip.Content>{`Tooltip ${iteration}`}</Tooltip.Content>
  </Tooltip>
));

export const VirtualTableMount = performanceStory((iteration) => (
  <div style={{ width: 640 }}>
    <VirtualTable
      aria-label={`Members ${iteration}`}
      columns={tableColumns}
      dataSource={virtualTableRows}
      rowKey="id"
      scroll={{ y: 320 }}
    />
  </div>
));

export const WizardMount = performanceStory((iteration) => (
  <Wizard step={iteration % 2 === 1 ? "details" : "account"}>
    <Wizard.Step value="account">
      <Wizard.Title>Account</Wizard.Title>
      Account details
    </Wizard.Step>
    <Wizard.Step value="details">
      <Wizard.Title>Details</Wizard.Title>
      Workspace details
    </Wizard.Step>
    <Wizard.Navigation />
  </Wizard>
));
