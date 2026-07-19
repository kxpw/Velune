import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Collapse,
  DatePicker,
  Form,
  Input,
  Modal,
  Pagination,
  Popover,
  Radio,
  Select,
  Switch,
  Table,
  Tabs,
  TextArea,
  VirtualTable,
} from "velune/react";

const meta = {
  title: "Performance/Interactions",
  parameters: {
    layout: "centered",
  },
};

export default meta;

const options = [
  { label: "Ready", value: "ready" },
  { label: "Pending", value: "pending" },
];

const largeOptions = Array.from({ length: 250 }, (_, index) => ({
  label: `Option ${index + 1}`,
  value: `option-${index + 1}`,
}));

const columns = [
  { key: "name", title: "Name", dataIndex: "name" },
  { key: "status", title: "Status", dataIndex: "status" },
];

const rows = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `Project ${index + 1}`,
  status: index % 2 === 0 ? "Ready" : "Pending",
}));

const virtualRows = Array.from({ length: 10_000 }, (_, index) => ({
  id: index + 1,
  name: `Member ${10_000 - index}`,
  status: index % 2 === 0 ? "Active" : "Invited",
}));

function Ready({ children }: { children: ReactNode }) {
  return <div data-interaction-ready="true">{children}</div>;
}

export const CheckboxInteraction = {
  render: () => (
    <Ready>
      <Checkbox defaultChecked={false}>Accept terms</Checkbox>
    </Ready>
  ),
};

const checkboxValues = Array.from(
  { length: 100 },
  (_, index) => `item-${index}`,
);

export const CheckboxGroupLargeInteraction = {
  render: () => (
    <Ready>
      <Checkbox.Group>
        {checkboxValues.map((value) => (
          <Checkbox key={value} value={value} aria-label={`group-${value}`}>
            {value}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </Ready>
  ),
};

export const CollapseInteraction = {
  render: () => (
    <Ready>
      <Collapse defaultValue="first" collapsible={false}>
        <Collapse.Item value="first">
          <Collapse.Trigger>First</Collapse.Trigger>
          <Collapse.Content>First content</Collapse.Content>
        </Collapse.Item>
        <Collapse.Item value="second">
          <Collapse.Trigger>Second</Collapse.Trigger>
          <Collapse.Content>Second content</Collapse.Content>
        </Collapse.Item>
      </Collapse>
    </Ready>
  ),
};

export const DatePickerInteraction = {
  render: () => (
    <Ready>
      <DatePicker
        aria-label="Deployment date"
        defaultValue={new Date(2026, 6, 1)}
        defaultOpen
      />
    </Ready>
  ),
};

function InputScenario() {
  const [value, setValue] = useState("");
  return (
    <Input
      aria-label="Performance input"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}

export const InputInteraction = {
  render: () => (
    <Ready>
      <InputScenario />
    </Ready>
  ),
};

const formFields = Array.from({ length: 100 }, (_, index) => `field-${index}`);

export const FormLargeInteraction = {
  render: () => (
    <Ready>
      <Form validateOnChange={false}>
        {formFields.map((name) => (
          <Form.Item key={name} name={name} noStyle>
            <input aria-label={name} />
          </Form.Item>
        ))}
      </Form>
    </Ready>
  ),
};

function ModalScenario() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="open-modal" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal open={open} onOpenChange={setOpen}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Performance modal</Modal.Title>
          </Modal.Header>
          <Modal.Body>Modal content</Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  );
}

export const ModalInteraction = {
  render: () => (
    <Ready>
      <ModalScenario />
    </Ready>
  ),
};

export const PaginationInteraction = {
  render: () => (
    <Ready>
      <Pagination defaultPage={2} pageSize={20} total={500} />
    </Ready>
  ),
};

export const PopoverInteraction = {
  render: () => (
    <Ready>
      <Popover portal={false}>
        <Popover.Trigger>
          <Button className="popover-toggle">Toggle popover</Button>
        </Popover.Trigger>
        <Popover.Content>Popover content</Popover.Content>
      </Popover>
    </Ready>
  ),
};

export const RadioInteraction = {
  render: () => (
    <Ready>
      <Radio.Group defaultValue="first">
        <Radio value="first">First</Radio>
        <Radio value="second">Second</Radio>
      </Radio.Group>
    </Ready>
  ),
};

const radioValues = Array.from({ length: 100 }, (_, index) => `item-${index}`);

export const RadioGroupLargeInteraction = {
  render: () => (
    <Ready>
      <Radio.Group defaultValue="item-0">
        {radioValues.map((value) => (
          <Radio key={value} value={value} aria-label={`radio-${value}`}>
            {value}
          </Radio>
        ))}
      </Radio.Group>
    </Ready>
  ),
};

export const SelectInteraction = {
  render: () => (
    <Ready>
      <Select aria-label="Status" defaultValue="ready" portal={false}>
        <Select.Trigger />
        <Select.Content>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </Ready>
  ),
};

export const SelectLargeNavigationInteraction = {
  render: () => (
    <Ready>
      <Select aria-label="Large dataset" defaultValue="option-1" portal={false}>
        <Select.Trigger />
        <Select.Content>
          {largeOptions.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </Ready>
  ),
};

function SelectLargeSearchScenario() {
  const rootRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    rootRef.current
      ?.querySelector<HTMLButtonElement>("[role=combobox]")
      ?.click();
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={rootRef} data-interaction-ready={ready ? "true" : "false"}>
      <Select
        aria-label="Searchable large dataset"
        defaultValue="option-1"
        portal={false}
        searchable
      >
        <Select.Trigger />
        <Select.Content>
          {largeOptions.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
}

export const SelectLargeSearchInteraction = {
  render: () => <SelectLargeSearchScenario />,
};

export const SwitchInteraction = {
  render: () => (
    <Ready>
      <Switch defaultChecked={false}>Notifications</Switch>
    </Ready>
  ),
};

export const TabsInteraction = {
  render: () => (
    <Ready>
      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">Overview panel</Tabs.Panel>
        <Tabs.Panel value="activity">Activity panel</Tabs.Panel>
      </Tabs>
    </Ready>
  ),
};

export const TableInteraction = {
  render: () => (
    <Ready>
      <Table
        aria-label="Projects"
        columns={columns}
        dataSource={rows}
        rowKey="id"
        selectable
      />
    </Ready>
  ),
};

const sortableColumns = [
  { key: "name", title: "Name", dataIndex: "name", sortable: true },
  { key: "status", title: "Status", dataIndex: "status" },
];

export const TableSortInteraction = {
  render: () => (
    <Ready>
      <Table
        aria-label="Sortable projects"
        columns={sortableColumns}
        dataSource={rows}
        rowKey="id"
      />
    </Ready>
  ),
};

function TextAreaScenario() {
  const [value, setValue] = useState("");
  return (
    <TextArea
      aria-label="Performance notes"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}

export const TextAreaInteraction = {
  render: () => (
    <Ready>
      <TextAreaScenario />
    </Ready>
  ),
};

export const VirtualTableScrollInteraction = {
  render: () => (
    <Ready>
      <div style={{ width: 640 }}>
        <VirtualTable
          aria-label="Virtual members"
          columns={columns}
          dataSource={virtualRows}
          rowKey="id"
          scroll={{ y: 320 }}
        />
      </div>
    </Ready>
  ),
};

export const VirtualTableSelectAllInteraction = {
  render: () => (
    <Ready>
      <div style={{ width: 640 }}>
        <VirtualTable
          aria-label="Selectable virtual members"
          columns={columns}
          dataSource={virtualRows}
          rowKey="id"
          scroll={{ y: 320 }}
          selectable
        />
      </div>
    </Ready>
  ),
};

export const VirtualTableSortInteraction = {
  render: () => (
    <Ready>
      <div style={{ width: 640 }}>
        <VirtualTable
          aria-label="Sortable virtual members"
          columns={sortableColumns}
          dataSource={virtualRows}
          rowKey="id"
          scroll={{ y: 320 }}
        />
      </div>
    </Ready>
  ),
};
