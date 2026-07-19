import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { Select } from "./Select";
import type { SelectOptionItem } from "./Select.options";
import type { SelectValue } from "./Select.types";

const flatOptions = [
  { value: "queued", label: "Queued" },
  { value: "running", label: "Running" },
  { value: "blocked", label: "Blocked", disabled: true },
  { value: "complete", label: "Complete" },
];

const groupedOptions: SelectOptionItem[] = [
  {
    label: "Status",
    options: [
      { value: "queued", label: "Queued" },
      { value: "running", label: "Running" },
      { value: "blocked", label: "Blocked", disabled: true },
      { value: "complete", label: "Complete" },
    ],
  },
  {
    label: "Priority",
    options: [
      { value: "p0", label: "P0 · Critical" },
      { value: "p1", label: "P1 · High" },
      { value: "p2", label: "P2 · Medium" },
      { value: "p3", label: "P3 · Low" },
    ],
  },
  {
    label: "Owner",
    options: [
      { value: "alice", label: "Alice" },
      { value: "bob", label: "Bob" },
      { value: "carol", label: "Carol" },
    ],
  },
];

function renderOptions(items: SelectOptionItem[]) {
  return (
    <Select.Content>
      {items.map((item, index) =>
        "options" in item ? (
          <Select.Group key={index} textValue={item.searchText}>
            <Select.GroupLabel>{item.label}</Select.GroupLabel>
            {item.options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                textValue={option.searchText}
              >
                {option.label}
              </Select.Item>
            ))}
          </Select.Group>
        ) : (
          <Select.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            textValue={item.searchText}
          >
            {item.label}
          </Select.Item>
        ),
      )}
    </Select.Content>
  );
}

const meta = {
  title: "React/Select",
  component: Select,
  parameters: {
    layout: "padded",
  },
};

export default meta;

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-5)",
  padding: "var(--space-6)",
  maxWidth: 420,
};

export const Default = {
  render: () => (
    <div style={stackStyle}>
      <Select name="status" aria-label="Status">
        <Select.Trigger placeholder="Choose status" />
        {renderOptions(flatOptions)}
      </Select>
    </div>
  ),
};

export const Grouped = {
  render: () => (
    <div style={stackStyle}>
      <Select fullWidth>
        <Select.Label>Filter</Select.Label>
        <Select.Description>
          Options are organized by category.
        </Select.Description>
        <Select.Trigger placeholder="Choose an option" />
        {renderOptions(groupedOptions)}
      </Select>
    </div>
  ),
};

export const Searchable = {
  render: () => (
    <div style={stackStyle}>
      <Select searchable searchPlaceholder="Search options…" fullWidth>
        <Select.Label>Search</Select.Label>
        <Select.Description>
          Search filters across all groups.
        </Select.Description>
        <Select.Trigger placeholder="Type to filter" />
        {renderOptions(groupedOptions)}
      </Select>
    </div>
  ),
};

export const GroupedMultipleSearch = {
  name: "Grouped + multiple + search",
  render: () => (
    <div style={stackStyle}>
      <Select multiple searchable defaultValue={["running", "alice"]} fullWidth>
        <Select.Label>Assignees & status</Select.Label>
        <Select.Trigger placeholder="Select items" />
        {renderOptions(groupedOptions)}
      </Select>
    </div>
  ),
};

export const RemoteSearch = {
  render: function RemoteSearchStory() {
    const [query, setQuery] = useState("");
    const options = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) {
        return groupedOptions;
      }
      return groupedOptions
        .map((group) => {
          if (!("options" in group)) {
            return group;
          }
          return {
            ...group,
            options: group.options.filter((option) =>
              String(option.label).toLowerCase().includes(q),
            ),
          };
        })
        .filter(
          (group) => "options" in group && group.options.length > 0,
        ) as SelectOptionItem[];
    }, [query]);

    return (
      <div style={stackStyle}>
        <Select searchable onSearch={setQuery} fullWidth>
          <Select.Label>Remote-style search</Select.Label>
          <Select.Description>
            Parent filters options via onSearch.
          </Select.Description>
          <Select.Trigger placeholder="Search remotely" />
          {renderOptions(options)}
        </Select>
      </div>
    );
  },
};

export const WithLabel = {
  render: () => (
    <div style={stackStyle}>
      <Select fullWidth>
        <Select.Label>Status</Select.Label>
        <Select.Description>Used for pipeline filtering.</Select.Description>
        <Select.Trigger placeholder="Choose status" />
        {renderOptions(flatOptions)}
      </Select>
    </div>
  ),
};

export const Multiple = {
  render: () => (
    <div style={stackStyle}>
      <Select multiple defaultValue={["queued", "running"]} fullWidth>
        <Select.Label>Multiple</Select.Label>
        <Select.Trigger />
        {renderOptions(flatOptions)}
      </Select>
    </div>
  ),
};

export const Controlled = {
  render: function ControlledStory() {
    const [value, setValue] = useState<SelectValue>("running");
    return (
      <div style={stackStyle}>
        <Select
          value={value}
          onValueChange={(next) => setValue(String(next))}
          fullWidth
        >
          <Select.Label>Controlled</Select.Label>
          <Select.Description>{`Selected: ${value}`}</Select.Description>
          <Select.Trigger />
          {renderOptions(flatOptions)}
        </Select>
      </div>
    );
  },
};

export const RtlLocalized = {
  render: () => (
    <div style={stackStyle} dir="rtl">
      <Select searchable dir="rtl" searchPlaceholder="بحث" fullWidth>
        <Select.Label>حالة المهمة</Select.Label>
        <Select.Trigger placeholder="اختر الحالة" />
        <Select.Empty>لا توجد خيارات</Select.Empty>
        <Select.NoMatches>لا توجد نتائج</Select.NoMatches>
        <Select.Content>
          <Select.Item value="queued">في الانتظار</Select.Item>
          <Select.Item value="running">قيد التنفيذ</Select.Item>
          <Select.Item value="complete">مكتملة</Select.Item>
        </Select.Content>
      </Select>
    </div>
  ),
};
