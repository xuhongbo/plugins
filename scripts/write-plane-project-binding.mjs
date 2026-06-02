#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { stdin as input, stdout as output } from "node:process";

const WORKSPACE_SLUG = "ledu";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  const values = await resolveValues(args);
  if (!uuidPattern.test(values.projectId)) {
    throw new Error("Invalid Plane project id: " + values.projectId);
  }

  const binding = {
    scope: "repo-local",
    workspace_slug: WORKSPACE_SLUG,
    project: {
      id: values.projectId,
      name: values.projectName,
      identifier: values.projectIdentifier,
    },
    note: "当前仓库的 Plane 项目绑定来自用户交互式配置。不要把该项目绑定写入全局 Codex、shell 或用户级配置。",
  };

  const outputPath = resolve(process.cwd(), ".plane-project.json");
  writeFileSync(outputPath, JSON.stringify(binding, null, 2) + "\n");
  console.log("Wrote " + outputPath);
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    const [rawKey, inlineValue] = arg.split("=", 2);
    const key = {
      "--project-id": "projectId",
      "--project-name": "projectName",
      "--project-identifier": "projectIdentifier",
    }[rawKey];

    if (!key) {
      throw new Error("Unknown argument: " + arg);
    }

    const nextValue = inlineValue ?? argv[index + 1];
    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error("Missing value for " + rawKey);
    }

    parsed[key] = nextValue.trim();
    if (inlineValue === undefined) {
      index += 1;
    }
  }

  return parsed;
}

async function resolveValues(args) {
  const keys = ["projectId", "projectName", "projectIdentifier"];
  const hasAnyArg = keys.some((key) => Boolean(args[key]));
  const hasAllArgs = keys.every((key) => Boolean(args[key]));

  if (hasAnyArg && !hasAllArgs) {
    throw new Error(
      "Provide all project binding arguments, or run without arguments for the interactive setup."
    );
  }

  if (hasAllArgs) {
    return {
      projectId: requireValue(args.projectId, "project id"),
      projectName: requireValue(args.projectName, "project name"),
      projectIdentifier: requireValue(args.projectIdentifier, "project identifier"),
    };
  }

  console.log("Plane repository project binding setup");
  console.log("This writes .plane-project.json in the current directory.");
  console.log("Workspace is fixed by the plugin: " + WORKSPACE_SLUG);
  console.log("No default project is prefilled. Use the project you want this repository to bind to.");
  console.log("");

  const rl = createInterface({ input, output, terminal: Boolean(input.isTTY) });
  const lines = rl[Symbol.asyncIterator]();
  try {
    return {
      projectId: await askRequired(lines, "Project id"),
      projectName: await askRequired(lines, "Project name"),
      projectIdentifier: await askRequired(lines, "Project identifier"),
    };
  } finally {
    rl.close();
  }
}

async function askRequired(lines, label) {
  output.write(label + ": ");
  const next = await lines.next();
  if (next.done) {
    throw new Error(label + " is required.");
  }
  const value = next.value.trim();
  return requireValue(value, label);
}

function requireValue(value, label) {
  if (!value) {
    throw new Error(label + " is required.");
  }
  return value;
}

function printUsage() {
  console.log(`Usage:
  node scripts/write-plane-project-binding.mjs

Interactive setup. The plugin workspace is fixed to ledu. The script asks for project id, project name, and project identifier.

Non-interactive setup:
  node scripts/write-plane-project-binding.mjs \\
    --project-id <uuid> \\
    --project-name <name> \\
    --project-identifier <identifier>`);
}
