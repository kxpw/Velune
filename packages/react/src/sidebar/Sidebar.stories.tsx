import { Folder, Home, MoreHorizontal, Plus, User, Users } from "lucide-react";
import { Sidebar } from "./Sidebar";

export default {
  title: "Navigation/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
};

export const Composition = {
  render: () => (
    <div className="min-h-svh w-full">
      <Sidebar.Provider>
        <Sidebar collapsible="icon">
          <Sidebar.Header>
            <span className="flex size-gs-10 shrink-0 items-center justify-center rounded-gs-sm bg-gs-surface-mist text-gs-sm font-gs-medium">
              V
            </span>
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
              <Sidebar.GroupAction aria-label="Add project">
                <Plus size={16} />
              </Sidebar.GroupAction>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton tooltip="Home">
                      <Home size={16} />
                      <span>Home</span>
                    </Sidebar.MenuButton>
                    <Sidebar.MenuAction aria-label="More" showOnHover>
                      <MoreHorizontal size={16} />
                    </Sidebar.MenuAction>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem defaultOpen>
                    <Sidebar.MenuButton tooltip="Projects">
                      <Folder size={16} />
                      <span>Projects</span>
                    </Sidebar.MenuButton>
                    <Sidebar.MenuSub>
                      <Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton>Active</Sidebar.MenuSubButton>
                      </Sidebar.MenuSubItem>
                      <Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton>Archived</Sidebar.MenuSubButton>
                      </Sidebar.MenuSubItem>
                    </Sidebar.MenuSub>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton current tooltip="Team">
                      <Users size={16} />
                      <span>Team</span>
                    </Sidebar.MenuButton>
                    <Sidebar.MenuBadge>8</Sidebar.MenuBadge>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton tooltip="Account">
                  <User size={16} />
                  <span>Account</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Footer>
        </Sidebar>
        <main className="relative flex min-h-full min-w-gs-0 flex-1 flex-col bg-gs-surface">
          <header className="flex h-gs-14 items-center gap-gs-2 border-b border-gs-border-default px-gs-4">
            <Sidebar.Trigger />
            <span className="text-gs-sm font-gs-medium">Overview</span>
          </header>
          <pre className="m-gs-0 overflow-auto p-gs-6 font-mono text-gs-xs leading-relaxed text-gs-text-secondary">
            {[
              "Sidebar.Provider",
              "├── Sidebar",
              "│   ├── Sidebar.Header",
              "│   ├── Sidebar.Content",
              "│   │   └── Sidebar.Group",
              "│       ├── Sidebar.GroupLabel",
              "│       ├── Sidebar.GroupAction",
              "│       └── Sidebar.GroupContent",
              "│           └── Sidebar.Menu",
              "│               └── Sidebar.MenuItem",
              "│                   ├── Sidebar.MenuButton",
              "│                   ├── Sidebar.MenuAction",
              "│                   ├── Sidebar.MenuBadge",
              "│                   └── Sidebar.MenuSub",
              "│                       └── Sidebar.MenuSubItem",
              "│                           └── Sidebar.MenuSubButton",
              "│   └── Sidebar.Footer",
              "└── (main)",
              "    └── Sidebar.Trigger",
            ].join("\n")}
          </pre>
        </main>
      </Sidebar.Provider>
    </div>
  ),
};
