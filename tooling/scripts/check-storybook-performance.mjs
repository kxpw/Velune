import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const root = process.cwd();
const host = "127.0.0.1";
const port = 6007;
const baseUrl = `http://${host}:${port}`;
const audit =
  process.env.PERFORMANCE_AUDIT === "1" || process.argv.includes("--audit");
const interactionsOnly =
  process.env.PERFORMANCE_INTERACTIONS_ONLY === "1" ||
  process.argv.includes("--interactions-only");
const sampleCount = readPositiveInteger("PERFORMANCE_SAMPLES", audit ? 15 : 7);
const updateCycles = readPositiveInteger("PERFORMANCE_UPDATE_CYCLES", 30);
const cpuThrottleRate = readPositiveNumber("PERFORMANCE_CPU_THROTTLE", 1);

const SIMPLE_BUDGET = { mount: 1.5, update: 1 };
const COMPOSITE_BUDGET = { mount: 3, update: 2 };
const OVERLAY_BUDGET = { mount: 5, update: 3 };
const CALENDAR_BUDGET = { mount: 5, update: 3 };
const DATA_BUDGET = { mount: 12, update: 8 };
const SIMPLE_INTERACTION_BUDGET = {
  event: 3,
  eventP95: 6,
  render: 2,
  renderP95: 4,
};
const COMPOSITE_INTERACTION_BUDGET = {
  event: 6,
  eventP95: 10,
  render: 3,
  renderP95: 6,
};
const CALENDAR_INTERACTION_BUDGET = {
  event: 6,
  eventP95: 10,
  render: 4,
  renderP95: 6,
};
const SELECT_INTERACTION_BUDGET = {
  event: 25,
  eventP95: 30,
  render: 3,
  renderP95: 5,
};
const DATA_INTERACTION_BUDGET = {
  event: 5,
  eventP95: 8,
  render: 3,
  renderP95: 5,
};
const OVERLAY_INTERACTION_BUDGET = {
  event: 10,
  eventP95: 12,
  render: 5,
  renderP95: 7,
};
const DATA_MUTATION_INTERACTION_BUDGET = {
  event: 8,
  eventP95: 12,
  render: 6,
  renderP95: 10,
};
const LARGE_DATA_MUTATION_INTERACTION_BUDGET = {
  event: 12,
  eventP95: 20,
  render: 10,
  renderP95: 15,
};

const stories = [
  story("Baseline", SIMPLE_BUDGET),
  story("ReliefCard", SIMPLE_BUDGET),
  story("Avatar", SIMPLE_BUDGET),
  story("Badge", SIMPLE_BUDGET),
  story("Box", SIMPLE_BUDGET),
  story("Button", SIMPLE_BUDGET),
  story("Card", COMPOSITE_BUDGET),
  story("Checkbox", SIMPLE_BUDGET),
  story("Collapse", COMPOSITE_BUDGET),
  story("Container", SIMPLE_BUDGET),
  story("DatePicker", CALENDAR_BUDGET),
  story("Divider", SIMPLE_BUDGET),
  story("Drawer", OVERLAY_BUDGET),
  story("Flex", SIMPLE_BUDGET),
  story("Form", COMPOSITE_BUDGET),
  story("Grid", SIMPLE_BUDGET),
  story("Input", SIMPLE_BUDGET),
  story("List", COMPOSITE_BUDGET),
  story("Modal", OVERLAY_BUDGET),
  story("Pagination", COMPOSITE_BUDGET),
  story("Popover", OVERLAY_BUDGET),
  story("Progress", SIMPLE_BUDGET),
  story("Radio", COMPOSITE_BUDGET),
  story("Select", COMPOSITE_BUDGET),
  story("SelectLarge", DATA_BUDGET),
  story("Skeleton", SIMPLE_BUDGET),
  story("Spinner", SIMPLE_BUDGET),
  story("Stack", SIMPLE_BUDGET),
  story("Switch", SIMPLE_BUDGET),
  story("Table", DATA_BUDGET),
  story("Tabs", COMPOSITE_BUDGET),
  story("Tag", SIMPLE_BUDGET),
  story("Text", SIMPLE_BUDGET),
  story("TextArea", SIMPLE_BUDGET),
  story("Toast", OVERLAY_BUDGET),
  story("Tooltip", OVERLAY_BUDGET),
  story("VirtualTable", DATA_BUDGET),
  story("Wizard", COMPOSITE_BUDGET),
];
const interactions = [
  interaction("Checkbox", [[".gs-checkbox-input"]], SIMPLE_INTERACTION_BUDGET),
  interaction(
    "CheckboxGroupLarge",
    [['[aria-label="group-item-0"]']],
    COMPOSITE_INTERACTION_BUDGET,
  ),
  interaction(
    "Collapse",
    [
      [".gs-collapse-item:nth-of-type(2) .gs-collapse-trigger"],
      [".gs-collapse-trigger:nth-of-type(1)"],
    ],
    COMPOSITE_INTERACTION_BUDGET,
  ),
  interaction(
    "DatePicker",
    [[".gs-datepicker-nav:first-of-type"], [".gs-datepicker-nav:last-of-type"]],
    CALENDAR_INTERACTION_BUDGET,
  ),
  interaction(
    "Input",
    [
      [{ selector: '[aria-label="Performance input"]', inputValue: "a" }],
      [{ selector: '[aria-label="Performance input"]', inputValue: "ab" }],
    ],
    SIMPLE_INTERACTION_BUDGET,
  ),
  interaction(
    "FormLarge",
    [
      [{ selector: '[aria-label="field-0"]', inputValue: "a" }],
      [{ selector: '[aria-label="field-0"]', inputValue: "ab" }],
    ],
    LARGE_DATA_MUTATION_INTERACTION_BUDGET,
  ),
  interaction(
    "Modal",
    [[".open-modal"], [".gs-modal-header-close"]],
    OVERLAY_INTERACTION_BUDGET,
  ),
  interaction(
    "Pagination",
    [['[aria-label="Next page"]'], ['[aria-label="Previous page"]']],
    SIMPLE_INTERACTION_BUDGET,
  ),
  interaction("Popover", [[".popover-toggle"]], OVERLAY_INTERACTION_BUDGET),
  interaction(
    "Radio",
    [
      ['input[type="radio"][value="second"]'],
      ['input[type="radio"][value="first"]'],
    ],
    SIMPLE_INTERACTION_BUDGET,
  ),
  interaction(
    "RadioGroupLarge",
    [['[aria-label="radio-item-1"]'], ['[aria-label="radio-item-0"]']],
    COMPOSITE_INTERACTION_BUDGET,
  ),
  interaction(
    "Select",
    [
      ["[role=combobox]", ".gs-select-option:nth-of-type(2)"],
      ["[role=combobox]", ".gs-select-option:nth-of-type(1)"],
    ],
    SELECT_INTERACTION_BUDGET,
  ),
  interaction(
    "SelectLargeNavigation",
    [[{ selector: "[role=combobox]", key: "ArrowDown" }]],
    SELECT_INTERACTION_BUDGET,
  ),
  interaction(
    "SelectLargeSearch",
    [
      [{ selector: ".gs-select-search", inputValue: "Option 249" }],
      [{ selector: ".gs-select-search", inputValue: "" }],
    ],
    COMPOSITE_INTERACTION_BUDGET,
  ),
  interaction("Switch", [["[role=switch]"]], SIMPLE_INTERACTION_BUDGET),
  interaction(
    "Tabs",
    [
      ['[role=tab][data-value="activity"]'],
      ['[role=tab][data-value="overview"]'],
    ],
    SIMPLE_INTERACTION_BUDGET,
  ),
  interaction("Table", [["tbody .gs-checkbox-input"]], DATA_INTERACTION_BUDGET),
  interaction(
    "TableSort",
    [[".gs-table-sort-button"]],
    DATA_MUTATION_INTERACTION_BUDGET,
  ),
  interaction(
    "TextArea",
    [
      [{ selector: '[aria-label="Performance notes"]', inputValue: "a" }],
      [{ selector: '[aria-label="Performance notes"]', inputValue: "ab" }],
    ],
    SIMPLE_INTERACTION_BUDGET,
  ),
  interaction(
    "VirtualTableScroll",
    [
      [{ selector: ".gs-table-scroll", scrollBy: 320 }],
      [{ selector: ".gs-table-scroll", scrollBy: -320 }],
    ],
    DATA_INTERACTION_BUDGET,
  ),
  interaction(
    "VirtualTableSelectAll",
    [['[aria-label="Select all rows"]']],
    LARGE_DATA_MUTATION_INTERACTION_BUDGET,
  ),
  interaction(
    "VirtualTableSort",
    [[".gs-table-sort-button"]],
    LARGE_DATA_MUTATION_INTERACTION_BUDGET,
  ),
];
const requestedComponents = new Set(
  (process.env.PERFORMANCE_COMPONENTS ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean),
);
const enabledStories = interactionsOnly
  ? []
  : requestedComponents.size === 0
    ? stories
    : stories.filter((benchmark) => requestedComponents.has(benchmark.name));
const enabledInteractions =
  requestedComponents.size === 0
    ? interactions
    : interactions.filter((benchmark) =>
        requestedComponents.has(benchmark.name),
      );

if (!interactionsOnly && enabledStories.length === 0) {
  throw new Error(
    `No performance stories matched: ${[...requestedComponents].join(", ")}`,
  );
}
if (interactionsOnly && enabledInteractions.length === 0) {
  throw new Error(
    `No interaction stories matched: ${[...requestedComponents].join(", ")}`,
  );
}

const storybookBin = join(
  root,
  "apps/storybook/node_modules/.bin",
  process.platform === "win32" ? "storybook.cmd" : "storybook",
);

await access(storybookBin);

const server = spawn(
  storybookBin,
  ["dev", "-p", String(port), "-h", host, "--ci", "--disable-telemetry"],
  {
    cwd: join(root, "apps/storybook"),
    detached: process.platform !== "win32",
    env: { ...process.env, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk;
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk;
});

try {
  await waitForServer(`${baseUrl}/index.json`);
  const browser = await chromium.launch({
    headless: true,
    args: audit ? ["--enable-precise-memory-info"] : [],
  });

  try {
    const failures = [];

    for (const benchmark of enabledStories) {
      const page = await browser.newPage();
      try {
        await configurePage(page);
        const url = `${baseUrl}/iframe.html?id=${benchmark.storyId}&viewMode=story`;
        await measureRender(page, url);

        const samples = [];
        for (let index = 0; index < sampleCount; index += 1) {
          samples.push(await measureRender(page, url));
        }

        if (process.env.PERFORMANCE_DEBUG === "1") {
          console.log(`${benchmark.name} samples: ${JSON.stringify(samples)}`);
        }

        const mountMedian = getMedian(samples.map((sample) => sample.mount));
        const updateMedian = getMedian(samples.map((sample) => sample.update));
        const mountP95 = getPercentile(
          samples.map((sample) => sample.mount),
          0.95,
        );
        const updateP95 = getPercentile(
          samples.map((sample) => sample.update),
          0.95,
        );
        const auditResult = audit
          ? await measureSustainedUpdates(page, updateCycles)
          : null;
        const summary = [
          `${benchmark.name}: mount ${mountMedian.toFixed(3)}ms`,
          `update ${updateMedian.toFixed(3)}ms`,
        ];
        if (auditResult) {
          summary.push(
            `p95 ${mountP95.toFixed(3)}/${updateP95.toFixed(3)}ms`,
            `sustained ${auditResult.median.toFixed(3)}ms p95 ${auditResult.p95.toFixed(3)}ms`,
            `heap ${formatBytes(auditResult.heapDelta)}`,
            `DOM ${auditResult.domStart}->${auditResult.domEnd} (max ${auditResult.domMax})`,
          );
        }
        console.log(summary.join(" / "));

        if (mountMedian > benchmark.budget.mount) {
          failures.push(
            `${benchmark.name} mount: ${mountMedian.toFixed(3)}ms > ${benchmark.budget.mount}ms`,
          );
        }
        if (updateMedian > benchmark.budget.update) {
          failures.push(
            `${benchmark.name} update: ${updateMedian.toFixed(3)}ms > ${benchmark.budget.update}ms`,
          );
        }
      } finally {
        await page.close();
      }
    }

    if (interactionsOnly || requestedComponents.size === 0) {
      console.log("\nInteraction latency (event-to-commit):");
      for (const benchmark of enabledInteractions) {
        const page = await browser.newPage();
        try {
          await configurePage(page);
          const result = await measureInteractions(
            page,
            `${baseUrl}/iframe.html?id=${benchmark.storyId}&viewMode=story`,
            benchmark.actions,
            updateCycles,
          );
          console.log(
            `${benchmark.name}: event ${result.eventMedian.toFixed(3)}ms p95 ${result.eventP95.toFixed(3)}ms / render ${result.renderMedian.toFixed(3)}ms p95 ${result.renderP95.toFixed(3)}ms / DOM ${result.domStart}->${result.domEnd} (max ${result.domMax})`,
          );
          if (result.eventMedian > benchmark.budget.event) {
            failures.push(
              `${benchmark.name} interaction: ${result.eventMedian.toFixed(3)}ms > ${benchmark.budget.event}ms`,
            );
          }
          if (result.renderMedian > benchmark.budget.render) {
            failures.push(
              `${benchmark.name} interaction render: ${result.renderMedian.toFixed(3)}ms > ${benchmark.budget.render}ms`,
            );
          }
          if (result.eventP95 > benchmark.budget.eventP95) {
            failures.push(
              `${benchmark.name} interaction p95: ${result.eventP95.toFixed(3)}ms > ${benchmark.budget.eventP95}ms`,
            );
          }
          if (result.renderP95 > benchmark.budget.renderP95) {
            failures.push(
              `${benchmark.name} interaction render p95: ${result.renderP95.toFixed(3)}ms > ${benchmark.budget.renderP95}ms`,
            );
          }
        } finally {
          await page.close();
        }
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `Component performance budget exceeded:\n${failures.join("\n")}`,
      );
    }
  } finally {
    await browser.close();
  }
} catch (error) {
  const output = serverOutput.trim();
  if (output) {
    console.error(output);
  }
  throw error;
} finally {
  await stopServer(server);
}

function story(name, budget) {
  return {
    name,
    storyId: `performance-all-components--${toKebabCase(name)}-mount`,
    budget,
  };
}

function interaction(name, actions, budget) {
  return {
    name,
    actions,
    budget,
    storyId: `performance-interactions--${toKebabCase(name)}-interaction`,
  };
}

function toKebabCase(value) {
  return value.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

async function waitForServer(url) {
  const timeoutAt = Date.now() + 60_000;

  while (Date.now() < timeoutAt) {
    if (server.exitCode !== null) {
      throw new Error(`Storybook exited with code ${server.exitCode}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Storybook is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Timed out waiting for Storybook");
}

async function stopServer(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;

  signalServer(child, "SIGTERM");
  if (await waitForExit(child, 5_000)) return;

  signalServer(child, "SIGKILL");
  await waitForExit(child, 5_000);
}

function signalServer(child, signal) {
  try {
    if (process.platform !== "win32" && child.pid) {
      process.kill(-child.pid, signal);
    } else {
      child.kill(signal);
    }
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
}

function waitForExit(child, timeout) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off("exit", onExit);
      resolve(false);
    }, timeout);
    child.once("exit", onExit);
  });
}

async function measureRender(page, url) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await measureRenderOnce(page, url);
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await page.goto("about:blank");
    }
  }

  throw new Error("Performance measurement exhausted its retry budget");
}

async function measureRenderOnce(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-performance-ready="true"]', {
    state: "attached",
    timeout: 30_000,
  });
  return page.evaluate(async () => {
    const initialSamples = window.__ZP_STORYBOOK_PROFILER__ ?? [];
    const mount = initialSamples.find((sample) => sample.phase === "mount");
    const update = window.__GS_PERFORMANCE_UPDATE__;
    if (!mount || !update) {
      throw new Error("Missing React Profiler mount or update driver");
    }

    window.__ZP_STORYBOOK_PROFILER__ = [];
    update();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const updates = window.__ZP_STORYBOOK_PROFILER__ ?? [];
    if (updates.length === 0) {
      throw new Error("Missing React Profiler mount or update sample");
    }
    return {
      mount: mount.actualDuration,
      update: Math.max(...updates.map((sample) => sample.actualDuration)),
      updates: updates.map((sample) => sample.actualDuration),
    };
  });
}

function getMedian(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function getPercentile(values, percentile) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil(sorted.length * percentile) - 1);
  return sorted[index];
}

function readPositiveInteger(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, received: ${raw}`);
  }
  return value;
}

function readPositiveNumber(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1) {
    throw new Error(`${name} must be a number greater than or equal to 1`);
  }
  return value;
}

async function configurePage(page) {
  if (cpuThrottleRate === 1) return;
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", {
    rate: cpuThrottleRate,
  });
}

async function measureSustainedUpdates(page, cycles) {
  const client = await page.context().newCDPSession(page);
  try {
    await runUpdateCycles(page, Math.min(5, cycles));
    await client.send("HeapProfiler.collectGarbage");
    const before = await client.send("Runtime.getHeapUsage");
    const result = await runUpdateCycles(page, cycles);
    await client.send("HeapProfiler.collectGarbage");
    const after = await client.send("Runtime.getHeapUsage");

    return {
      median: getMedian(result.durations),
      p95: getPercentile(result.durations, 0.95),
      heapDelta: after.usedSize - before.usedSize,
      domStart: result.domCounts[0],
      domEnd: result.domCounts[result.domCounts.length - 1],
      domMax: Math.max(...result.domCounts),
    };
  } finally {
    await client.detach();
  }
}

async function runUpdateCycles(page, cycles) {
  return page.evaluate(async (updateCount) => {
    const update = window.__GS_PERFORMANCE_UPDATE__;
    if (!update) {
      throw new Error("Performance story did not expose an update driver");
    }

    window.__ZP_STORYBOOK_PROFILER__ = [];
    const durations = [];
    const domCounts = [document.querySelectorAll("*").length];

    for (let index = 0; index < updateCount; index += 1) {
      const sampleStart = window.__ZP_STORYBOOK_PROFILER__.length;
      update();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const commits = window.__ZP_STORYBOOK_PROFILER__.slice(sampleStart);
      if (commits.length === 0) {
        throw new Error(`No profiler commit for sustained update ${index + 1}`);
      }
      durations.push(
        Math.max(...commits.map((sample) => sample.actualDuration)),
      );
      domCounts.push(document.querySelectorAll("*").length);
    }

    window.__ZP_STORYBOOK_PROFILER__ = [];
    return { durations, domCounts };
  }, cycles);
}

async function measureInteractions(page, url, actionSets, cycles) {
  await loadInteractionStory(page, url);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(resolve)),
  );

  return page.evaluate(
    async ({ actions, updateCount }) => {
      for (const selectors of actions) {
        for (const action of selectors) {
          const selector =
            typeof action === "string" ? action : action.selector;
          const element = await findActionElement(selector, "warmup");
          runAction(element, action);
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const eventDurations = [];
      const renderDurations = [];
      const domCounts = [document.querySelectorAll("*").length];
      window.__ZP_STORYBOOK_PROFILER__ = [];

      for (let index = 0; index < updateCount; index += 1) {
        const selectors = actions[index % actions.length];
        const sampleStart = window.__ZP_STORYBOOK_PROFILER__.length;
        const startedAt = performance.now();
        let synchronousDuration = 0;
        for (const action of selectors) {
          const selector =
            typeof action === "string" ? action : action.selector;
          const element = await findActionElement(selector, "measurement");
          const actionStartedAt = performance.now();
          runAction(element, action);
          synchronousDuration += performance.now() - actionStartedAt;
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const commits = window.__ZP_STORYBOOK_PROFILER__.slice(sampleStart);
        eventDurations.push(
          commits.length === 0
            ? synchronousDuration
            : Math.max(...commits.map((sample) => sample.commitTime)) -
                startedAt,
        );
        renderDurations.push(
          commits.length === 0
            ? 0
            : Math.max(...commits.map((sample) => sample.actualDuration)),
        );
        domCounts.push(document.querySelectorAll("*").length);
      }

      return {
        eventMedian: percentile(eventDurations, 0.5),
        eventP95: percentile(eventDurations, 0.95),
        renderMedian: percentile(renderDurations, 0.5),
        renderP95: percentile(renderDurations, 0.95),
        domStart: domCounts[0],
        domEnd: domCounts[domCounts.length - 1],
        domMax: Math.max(...domCounts),
      };

      function percentile(values, fraction) {
        const sorted = [...values].sort((a, b) => a - b);
        return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
      }

      function runAction(element, action) {
        if (typeof action === "string") {
          element.click();
          return;
        }
        if ("inputValue" in action) {
          const prototype =
            element instanceof HTMLTextAreaElement
              ? HTMLTextAreaElement.prototype
              : HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(
            prototype,
            "value",
          )?.set;
          setter?.call(element, action.inputValue);
          element.dispatchEvent(new Event("input", { bubbles: true }));
          return;
        }
        if ("scrollBy" in action) {
          element.scrollTop += action.scrollBy;
          element.dispatchEvent(new Event("scroll", { bubbles: false }));
          return;
        }
        element.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: action.key,
            bubbles: true,
            cancelable: true,
          }),
        );
      }

      async function findActionElement(selector, phase) {
        for (let frame = 0; frame < 4; frame += 1) {
          const element = document.querySelector(selector);
          if (element instanceof HTMLElement) {
            return element;
          }
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        throw new Error(`Interaction ${phase} target not found: ${selector}`);
      }
    },
    { actions: actionSets, updateCount: cycles },
  );
}

async function loadInteractionStory(page, url) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    try {
      await page.waitForSelector('[data-interaction-ready="true"]', {
        state: "attached",
        timeout: 30_000,
      });
      return;
    } catch (error) {
      if (attempt === 1) throw error;
    }
  }
}

function formatBytes(value) {
  const sign = value < 0 ? "-" : "+";
  const absolute = Math.abs(value);
  if (absolute < 1024) return `${sign}${absolute}B`;
  return `${sign}${(absolute / 1024).toFixed(1)}KiB`;
}
