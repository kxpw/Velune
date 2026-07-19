import type { CSSProperties } from "react";
import { useState } from "react";
import { Text } from "../text";
import { Collapse } from "./Collapse";

const meta = {
  title: "React/Collapse",
  component: Collapse,
  parameters: { layout: "padded" },
};

export default meta;

const frame: CSSProperties = {
  maxWidth: 480,
  padding: "var(--space-6)",
};

export const Single = {
  render: () => (
    <div style={frame}>
      <Collapse type="single" defaultValue="a" collapsible>
        <Collapse.Item value="a">
          <Collapse.Trigger>Is Velune open source?</Collapse.Trigger>
          <Collapse.Content>
            <Text size="sm">
              Yes. Packages ship under the monorepo with documented contribution
              guidelines.
            </Text>
          </Collapse.Content>
        </Collapse.Item>
        <Collapse.Item value="b">
          <Collapse.Trigger>How are themes applied?</Collapse.Trigger>
          <Collapse.Content>
            <Text size="sm">
              Via ThemeProvider and CSS variables generated from tokens.json.
            </Text>
          </Collapse.Content>
        </Collapse.Item>
        <Collapse.Item value="c">
          <Collapse.Trigger>Does it support dark mode?</Collapse.Trigger>
          <Collapse.Content>
            <Text size="sm">
              Light, dark, and high-contrast presets are included.
            </Text>
          </Collapse.Content>
        </Collapse.Item>
      </Collapse>
    </div>
  ),
};

export const Multiple = {
  render: function MultipleStory() {
    const [value, setValue] = useState<string[]>(["docs"]);
    return (
      <div style={frame}>
        <Collapse
          type="multiple"
          value={value}
          onValueChange={(next) => setValue(next as string[])}
        >
          <Collapse.Item value="docs">
            <Collapse.Trigger>Documentation</Collapse.Trigger>
            <Collapse.Content>
              <Text size="sm">Guides, API reference, and recipes.</Text>
            </Collapse.Content>
          </Collapse.Item>
          <Collapse.Item value="examples">
            <Collapse.Trigger>Examples</Collapse.Trigger>
            <Collapse.Content>
              <Text size="sm">Playground demos and Storybook stories.</Text>
            </Collapse.Content>
          </Collapse.Item>
        </Collapse>
      </div>
    );
  },
};

export const Plain = {
  render: () => (
    <div style={frame}>
      <Collapse variant="plain" defaultValue="theme">
        <Collapse.Item value="theme">
          <Collapse.Trigger>Theme tokens</Collapse.Trigger>
          <Collapse.Content>
            <Text size="sm">Semantic colors adapt to every theme.</Text>
          </Collapse.Content>
        </Collapse.Item>
        <Collapse.Item value="motion">
          <Collapse.Trigger>Motion preferences</Collapse.Trigger>
          <Collapse.Content>
            <Text size="sm">Reduced motion is respected automatically.</Text>
          </Collapse.Content>
        </Collapse.Item>
      </Collapse>
    </div>
  ),
};

export const HorizontalRtl = {
  render: () => (
    <div style={{ ...frame, maxWidth: 760 }} dir="rtl">
      <Collapse orientation="horizontal" dir="rtl" defaultValue="account">
        <Collapse.Item value="account">
          <Collapse.Trigger>الحساب</Collapse.Trigger>
          <Collapse.Content>
            <Text size="sm">إدارة بيانات الحساب وتفضيلات تسجيل الدخول.</Text>
          </Collapse.Content>
        </Collapse.Item>
        <Collapse.Item value="privacy">
          <Collapse.Trigger>الخصوصية</Collapse.Trigger>
          <Collapse.Content>
            <Text size="sm">التحكم في مشاركة البيانات وظهور الملف.</Text>
          </Collapse.Content>
        </Collapse.Item>
        <Collapse.Item value="alerts">
          <Collapse.Trigger>التنبيهات</Collapse.Trigger>
          <Collapse.Content>
            <Text size="sm">اختيار التنبيهات التي تريد استلامها.</Text>
          </Collapse.Content>
        </Collapse.Item>
      </Collapse>
    </div>
  ),
};
